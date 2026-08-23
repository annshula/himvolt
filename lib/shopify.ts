/**
 * Shopify Storefront API adapter. `createCheckout()` is the one live call
 * left here — cart creation is inherently real-time. `getProduct()` is no
 * longer live: it reads the synced catalog (data/product.json), refreshed
 * only by `npm run shopify:sync-product` or POST /api/admin/sync-product
 * (lib/shopify/sync-product.ts), so the product page never depends on
 * Shopify responding at request time.
 */

import { priceForMarket, syncedProduct } from "./catalog";
import { product as fallback, type Product, type Variant } from "./product";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-07";

export const shopifyEnabled = Boolean(DOMAIN && TOKEN);

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 300,
): Promise<T | null> {
  if (!shopifyEnabled) return null;

  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate, tags: ["shopify"] },
  });

  if (!res.ok) {
    console.error(`Shopify ${res.status}: ${await res.text()}`);
    return null;
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    console.error("Shopify GraphQL errors", json.errors);
    return null;
  }
  return json.data ?? null;
}

/**
 * Builds the product model from the synced catalog (data/product.json) only
 * — no live Shopify call. Price, availability and variant ids come from the
 * last `npm run shopify:sync-product` / `POST /api/admin/sync-product` run;
 * gallery, description and specs stay the hand-written presentation content
 * from lib/product.ts, since the raw Shopify catalog data is CJ-sourced and
 * not fit to show a shopper directly.
 *
 * Kept `async` for call-site compatibility even though nothing here awaits —
 * every caller already does `await getProduct()`.
 */
export async function getProduct(
  handle: string = syncedProduct.handle,
): Promise<Product> {
  void handle; // data/product.json holds exactly one product — nothing to select between.

  const variants: Variant[] = syncedProduct.variants.map((synced, i) => {
    const pres = fallback.variants[i];
    // No country known yet at this layer (that's the currency selector's
    // job, applied on top via useLocalizedAmount) — priceForMarket(id, null)
    // resolves to the US market's real price, not the raw Admin default
    // (a different, lower number — see lib/catalog.ts's priceForMarket).
    const defaultPrice = priceForMarket(synced.id, null);
    return {
      // Real Shopify gid — the cart + checkout resolve against data/product.json.
      id: synced.id,
      sku: pres?.sku ?? synced.title,
      // Keep the local presentation title ("One band") over the raw Shopify
      // option title ("Square Bracelet / 1PCS") — ids stay real.
      title: pres?.title ?? synced.title,
      subtitle: pres?.subtitle ?? "",
      quantity: pres?.quantity ?? 1,
      price: { amount: defaultPrice.amount, currencyCode: defaultPrice.currencyCode },
      compareAtPrice:
        defaultPrice.compareAtAmount != null
          ? { amount: defaultPrice.compareAtAmount, currencyCode: defaultPrice.currencyCode }
          : undefined,
      badge: pres?.badge,
      offer: pres?.offer,
      image: pres?.image ?? fallback.gallery[0]?.src ?? "",
      availableForSale: synced.availableForSale,
      weightGrams: pres?.weightGrams ?? 40,
    };
  });

  return {
    ...fallback,
    id: syncedProduct.id,
    handle: syncedProduct.handle,
    title: syncedProduct.title,
    variants: variants.length ? variants : fallback.variants,
  };
}

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        message
      }
    }
  }
`;

/** Creates a Shopify cart and returns the hosted checkout URL. */
export async function createCheckout(
  variantId: string,
  quantity = 1,
): Promise<string | null> {
  const data = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(CART_CREATE, { lines: [{ merchandiseId: variantId, quantity }] }, 0);

  return data?.cartCreate.cart?.checkoutUrl ?? null;
}
