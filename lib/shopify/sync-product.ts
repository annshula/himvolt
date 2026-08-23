import "server-only";
import { writeFile, rename } from "node:fs/promises";
import { join } from "node:path";

import { graphqlRequest } from "@/lib/shopify/client";
import { getAdminToken } from "@/lib/shopify/admin-token";
import {
  adminEndpoint,
  isAdminConfigured,
  isStorefrontConfigured,
  shopifyConfig,
  storefrontEndpoint,
} from "@/lib/shopify/config";
import { getLocalizedVariantPrices } from "@/lib/shopify/localization-service";

/**
 * Single-product Shopify sync — the one place this app ever talks to Shopify
 * live. Everything else (product page, shop listing, currency selector, cart)
 * reads only data/product.json, written here. Two callers: `npm run
 * shopify:sync-product` (scripts/sync-product.mjs, its own standalone copy —
 * see the note there) and POST /api/admin/sync-product.
 *
 * Two Shopify APIs, two jobs:
 *  - Admin API: the product itself — id, handle, title, variants, base price.
 *  - Storefront API, once per real market: this store has genuinely distinct
 *    price lists for a handful of markets (found via Admin's `markets`
 *    query — a market scoped to exactly one country region is a real,
 *    merchant-configured market; one scoped to many is the "International"
 *    catch-all and is skipped, its price already covered by the base price).
 *    Freezing a snapshot only makes sense for markets with their own price
 *    list — the catch-all's price is live-FX-converted and would just go
 *    stale if snapshotted, so it isn't.
 */

const OUTPUT_PATH = join(process.cwd(), "data", "product.json");

const SHOP_QUERY = /* GraphQL */ `
  query Shop {
    shop {
      name
      currencyCode
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      variants(first: 100) {
        nodes {
          id
          title
          price
          compareAtPrice
          availableForSale
        }
      }
    }
  }
`;

const PRODUCT_SEARCH_QUERY = /* GraphQL */ `
  query ProductSearch($query: String!) {
    products(first: 5, query: $query) {
      nodes {
        id
        handle
        title
        variants(first: 100) {
          nodes {
            id
            title
            price
            compareAtPrice
            availableForSale
          }
        }
      }
    }
  }
`;

const MARKETS_QUERY = /* GraphQL */ `
  query Markets {
    markets(first: 20) {
      nodes {
        name
        enabled
        regions(first: 10) {
          nodes {
            ... on MarketRegionCountry {
              code
            }
          }
        }
      }
    }
  }
`;

type VariantNode = {
  id: string;
  title: string;
  price: string | null;
  compareAtPrice: string | null;
  availableForSale: boolean;
};

type ProductNode = {
  id: string;
  handle: string;
  title: string;
  variants: { nodes: VariantNode[] } | null;
};

type MarketPrice = { amount: number; compareAtAmount: number | null; currencyCode: string };

function normalizeVariants(nodes: VariantNode[]) {
  return nodes
    .filter((v) => v.price != null)
    .map((v) => {
      const price = Number(v.price);
      const compare = v.compareAtPrice != null ? Number(v.compareAtPrice) : null;
      return {
        id: v.id,
        title: v.title,
        price,
        compareAtPrice: compare != null && compare > price ? compare : null,
        availableForSale: v.availableForSale,
      };
    });
}

/** Single-country markets are real, merchant-priced markets; multi-country ones are the "sell everywhere" catch-all. */
async function discoverCuratedMarketCountries(
  adminRequest: <T>(query: string, variables?: Record<string, unknown>) => Promise<T>,
): Promise<string[]> {
  const data = await adminRequest<{
    markets: { nodes: { name: string; enabled: boolean; regions: { nodes: { code?: string }[] } }[] };
  }>(MARKETS_QUERY);

  const codes = new Set<string>();
  for (const market of data.markets.nodes) {
    if (!market.enabled) continue;
    const regionCodes = market.regions.nodes.map((r) => r.code).filter((c): c is string => Boolean(c));
    if (regionCodes.length === 1) codes.add(regionCodes[0]);
  }
  return [...codes];
}

export type SyncedProductRecord = {
  version: 3;
  syncedAt: string;
  shop: { domain: string; name: string; currencyCode: string };
  markets: string[];
  product: {
    id: string;
    handle: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    currencyCode: string;
    availableForSale: boolean;
    variants: (ReturnType<typeof normalizeVariants>[number] & {
      pricesByMarket: Record<string, MarketPrice>;
    })[];
  };
};

/**
 * Fetches the HimVolt product from the Shopify Admin API by handle (falling
 * back to a title/SKU search), fetches each curated market's price list from
 * the Storefront API, and overwrites data/product.json with the result.
 * Throws on any failure — callers decide how to report it.
 */
export async function syncProduct(
  handle = "the-tourmaline-band",
): Promise<SyncedProductRecord> {
  const cfg = shopifyConfig();
  if (!cfg.storeDomain) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not set.");
  }
  if (!isAdminConfigured(cfg)) {
    throw new Error(
      "Shopify Admin API is not configured — set SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET (or SHOPIFY_ADMIN_API_TOKEN).",
    );
  }

  const endpoint = adminEndpoint(cfg);
  const adminToken = await getAdminToken();
  // The Admin API authenticates via X-Shopify-Access-Token, not a bearer
  // Authorization header (that header is Storefront/Customer Account only).
  const adminRequest = <T>(query: string, variables: Record<string, unknown> = {}) =>
    graphqlRequest<T>({
      endpoint,
      query,
      variables,
      headers: { "X-Shopify-Access-Token": adminToken },
    });

  const [shopData, byHandle] = await Promise.all([
    adminRequest<{ shop: { name: string; currencyCode: string } | null }>(SHOP_QUERY),
    adminRequest<{ productByHandle: ProductNode | null }>(PRODUCT_BY_HANDLE_QUERY, {
      handle,
    }),
  ]);

  let product = byHandle.productByHandle;
  if (!product) {
    const search = await adminRequest<{ products: { nodes: ProductNode[] } }>(
      PRODUCT_SEARCH_QUERY,
      { query: "title:*tourmaline* OR sku:CJSL2782*" },
    );
    product = search.products.nodes[0] ?? null;
  }
  if (!product) {
    throw new Error(`No HimVolt product found for handle "${handle}" on this store.`);
  }

  const variants = normalizeVariants(product.variants?.nodes ?? []);
  const saleVariant = variants.find((v) => v.availableForSale) ?? variants[0];
  const price = saleVariant?.price ?? null;
  if (price == null) {
    throw new Error("Product has no priced, saleable variant.");
  }
  const compare = saleVariant?.compareAtPrice ?? null;
  const currency = shopData.shop?.currencyCode || "USD";

  // A permissions gap (e.g. the Admin app is missing the read_markets scope)
  // must not take down the base product sync — just skip market prices.
  const markets = await discoverCuratedMarketCountries(adminRequest).catch(() => []);
  const variantIds = variants.map((v) => v.id);

  const pricesByVariant = new Map<string, Record<string, MarketPrice>>(
    variants.map((v) => [v.id, {}]),
  );

  if (markets.length > 0 && isStorefrontConfigured(cfg)) {
    void storefrontEndpoint(cfg); // ensures config is valid before the loop below
    await Promise.all(
      markets.map(async (country) => {
        const priceMap = await getLocalizedVariantPrices(variantIds, country).catch(
          () => new Map(),
        );
        for (const [variantId, localized] of priceMap) {
          const bucket = pricesByVariant.get(variantId);
          if (!bucket) continue;
          bucket[country] = {
            amount: Number(localized.amount),
            compareAtAmount:
              localized.compareAtAmount != null ? Number(localized.compareAtAmount) : null,
            currencyCode: localized.currencyCode,
          };
        }
      }),
    );
  }

  const record: SyncedProductRecord = {
    version: 3,
    syncedAt: new Date().toISOString(),
    shop: {
      domain: cfg.storeDomain,
      name: shopData.shop?.name || "HimVolt",
      currencyCode: currency,
    },
    markets,
    product: {
      id: product.id,
      handle: product.handle,
      title: product.title,
      price,
      compareAtPrice: compare != null && compare > price ? compare : null,
      currencyCode: currency,
      availableForSale: variants.some((v) => v.availableForSale),
      variants: variants.map((v) => ({
        ...v,
        pricesByMarket: pricesByVariant.get(v.id) ?? {},
      })),
    },
  };

  // Atomic write — a crash mid-write must never leave data/product.json truncated.
  const tmpPath = `${OUTPUT_PATH}.tmp`;
  await writeFile(tmpPath, `${JSON.stringify(record, null, 2)}\n`);
  await rename(tmpPath, OUTPUT_PATH);

  return record;
}
