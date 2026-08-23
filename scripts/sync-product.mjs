/**
 * `node scripts/sync-product.mjs` — refresh every product in data/product.json
 * from the Shopify Admin + Storefront APIs and overwrite the file.
 *
 * "Exactly the SKUs, no extra items": the set of products synced is driven
 * by the `id`s already present in data/product.json (a `nodes(ids: [...])`
 * lookup), never a title/SKU search — a search can silently match the wrong
 * product on a shared store. To add a sixth product, add its id/handle plus
 * curated fields to data/product.json by hand first; the next sync fills in
 * the live Shopify fields for it. If Shopify no longer has one of the known
 * ids (deleted upstream), that product is dropped and the run says so loudly
 * rather than leaving a phantom listing in the file forever.
 *
 * Every product/variant record mixes two kinds of field, and this script
 * only ever touches the first kind:
 *  - Shopify-sourced (overwritten every run): images, variant sku/price/
 *    compareAtPrice/availableForSale/image, pricesByMarket.
 *  - Curated (preserved verbatim from the existing file): the product's
 *    display `title`, subtitle, material, descriptionHtml, specs, and each
 *    variant's display `title`/`subtitle`/`quantity`/`weightGrams`/`badge`/
 *    `offer` — hand-authored content Shopify has no field for (Mohs
 *    hardness, an honest claims policy, a cleaned-up name vs. Shopify's raw,
 *    sometimes CJ-sourced-and-wrong title/option string — see `title` vs
 *    `shopifyTitle` below). A genuinely new product/variant with no curated
 *    record yet falls back to the raw Shopify title and gets flagged in the
 *    run's output — there is no way to auto-generate honest marketing copy
 *    for it.
 *
 * "Curated market" = a Shopify Market scoped to exactly one country region —
 * that means it has its own price list worth freezing into this file. A
 * market scoped to many countries (the "International" catch-all) is
 * skipped: its price is live-FX-converted and would just go stale if
 * snapshotted, and it's already covered by each product's base price.
 *
 * The Admin access token is generated at runtime via the client-credentials
 * grant (Client ID + Secret → 24h token) — never passed in directly.
 *
 * Zero imports from the app's TS module graph so this runs with plain
 * `node`, no build step.
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT = join(ROOT, "data", "product.json");

/* ── minimal .env loader ───────────────────────────────────────────────── */
function loadEnv() {
  const result = {};
  const path = join(ROOT, ".env");
  if (!existsSync(path)) return result;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const env = loadEnv();
for (const [key, value] of Object.entries(env)) {
  if (process.env[key] === undefined && value !== undefined)
    process.env[key] = value;
}

const cfg = {
  storeDomain: (process.env.SHOPIFY_STORE_DOMAIN ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, ""),
  apiVersion: process.env.SHOPIFY_API_VERSION || "2026-07",
  adminClientId: process.env.SHOPIFY_ADMIN_CLIENT_ID || null,
  adminClientSecret: process.env.SHOPIFY_ADMIN_CLIENT_SECRET || null,
  adminToken: process.env.SHOPIFY_ADMIN_API_TOKEN || null,
  storefrontToken: process.env.SHOPIFY_STOREFRONT_API_TOKEN || null,
};

if (!cfg.storeDomain) {
  console.error(
    "✖ SHOPIFY_STORE_DOMAIN is not set (e.g. your-store.myshopify.com)",
  );
  process.exit(1);
}
if (!cfg.adminToken && !(cfg.adminClientId && cfg.adminClientSecret)) {
  console.error(
    "✖ Admin API is not configured. Set SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET in .env (or a legacy SHOPIFY_ADMIN_API_TOKEN).",
  );
  process.exit(1);
}

let cachedToken = null;
async function getAdminToken() {
  if (cfg.adminToken) return cfg.adminToken;
  if (cachedToken) return cachedToken;
  const res = await fetch(
    `https://${cfg.storeDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: cfg.adminClientId,
        client_secret: cfg.adminClientSecret,
      }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        `token request failed (HTTP ${res.status})`,
    );
  }
  cachedToken = data.access_token;
  return cachedToken;
}

const adminEndpoint = `https://${cfg.storeDomain}/admin/api/${cfg.apiVersion}/graphql.json`;
const storefrontEndpoint = `https://${cfg.storeDomain}/api/${cfg.apiVersion}/graphql.json`;

async function adminRequest(query, variables = {}) {
  const token = await getAdminToken();
  const res = await fetch(adminEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message || `HTTP ${res.status}`);
  }
  return body.data;
}

async function storefrontRequest(query, variables = {}) {
  const res = await fetch(storefrontEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": cfg.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message || `HTTP ${res.status}`);
  }
  return body.data;
}

const SHOP_QUERY = `query { shop { name currencyCode } }`;

const PRODUCTS_BY_ID_QUERY = `
query ProductsByIds($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      handle
      title
      images(first: 20) { nodes { url altText width height } }
      variants(first: 100) {
        nodes {
          id
          title
          sku
          price
          compareAtPrice
          availableForSale
          image { url altText width height }
        }
      }
    }
  }
}`;

const MARKETS_QUERY = `
query Markets {
  markets(first: 20) {
    nodes {
      name
      enabled
      regions(first: 10) {
        nodes { ... on MarketRegionCountry { code } }
      }
    }
  }
}`;

const VARIANT_PRICES_QUERY = `
query VariantPrices($ids: [ID!]!, $country: CountryCode) @inContext(country: $country) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
    }
  }
}`;

/** Single-country markets are real, merchant-priced markets; multi-country ones are the "sell everywhere" catch-all. */
async function discoverCuratedMarketCountries() {
  const data = await adminRequest(MARKETS_QUERY);
  const codes = new Set();
  for (const market of data.markets.nodes) {
    if (!market.enabled) continue;
    const regionCodes = market.regions.nodes
      .map((r) => r.code)
      .filter(Boolean);
    if (regionCodes.length === 1) codes.add(regionCodes[0]);
  }
  return [...codes];
}

async function pricesForMarket(variantIds, country) {
  const prices = {};
  // Storefront `nodes` caps out well below our whole-catalog variant count on
  // some plans — chunk defensively instead of assuming one call covers it.
  const chunkSize = 100;
  for (let i = 0; i < variantIds.length; i += chunkSize) {
    const chunk = variantIds.slice(i, i + chunkSize);
    const data = await storefrontRequest(VARIANT_PRICES_QUERY, {
      ids: chunk,
      country,
    });
    for (const node of data.nodes) {
      if (!node?.price) continue;
      prices[node.id] = {
        amount: Number(node.price.amount),
        compareAtAmount:
          node.compareAtPrice != null ? Number(node.compareAtPrice.amount) : null,
        currencyCode: node.price.currencyCode,
      };
    }
  }
  return prices;
}

function toImage(node, fallbackAlt, existingBySrc) {
  const existing = existingBySrc.get(node.url);
  return {
    src: node.url,
    // Shopify's own altText on this store is a meaningless upload hash —
    // keep whatever hand-written alt we already had for this exact image,
    // otherwise fall back to the product title rather than the hash.
    alt: existing?.alt ?? fallbackAlt,
    width: node.width,
    height: node.height,
  };
}

async function main() {
  if (!existsSync(OUTPUT)) {
    console.error(
      `✖ ${OUTPUT} does not exist — this script refreshes known products, it doesn't create the catalog from scratch. Seed it with at least one product's id/handle/curated fields first.`,
    );
    process.exit(1);
  }
  const existing = JSON.parse(readFileSync(OUTPUT, "utf8"));
  const knownIds = existing.products.map((p) => p.id);
  console.log(`· syncing ${knownIds.length} known product(s) from ${cfg.storeDomain}`);

  const [shopData, fresh] = await Promise.all([
    adminRequest(SHOP_QUERY),
    adminRequest(PRODUCTS_BY_ID_QUERY, { ids: knownIds }),
  ]);
  const currency = shopData?.shop?.currencyCode || existing.shop?.currencyCode || "USD";

  const freshById = new Map(
    (fresh.nodes ?? []).filter(Boolean).map((p) => [p.id, p]),
  );
  const existingById = new Map(existing.products.map((p) => [p.id, p]));

  for (const id of knownIds) {
    if (!freshById.has(id)) {
      console.error(
        `  ✖ product ${id} (${existingById.get(id)?.handle}) no longer exists on Shopify — dropping it from data/product.json`,
      );
    }
  }

  console.log("· discovering curated markets…");
  let markets = [];
  if (!cfg.storefrontToken) {
    console.log("  SHOPIFY_STOREFRONT_API_TOKEN not set — skipping per-market prices");
  } else {
    try {
      markets = await discoverCuratedMarketCountries();
      console.log(`  ${markets.length} curated market(s): ${markets.join(", ") || "none"}`);
    } catch (err) {
      // A permissions gap (e.g. the Admin app is missing the read_markets
      // scope) must not take down the base sync — just skip market prices.
      console.log(`  ✖ market discovery failed, skipping per-market prices: ${err.message}`);
    }
  }

  const allVariantIds = [...freshById.values()].flatMap((p) =>
    (p.variants?.nodes ?? []).map((v) => v.id),
  );
  const pricesByVariant = new Map(allVariantIds.map((id) => [id, {}]));

  await Promise.all(
    markets.map(async (country) => {
      const prices = await pricesForMarket(allVariantIds, country).catch((err) => {
        console.error(`  ✖ ${country} prices failed: ${err.message}`);
        return {};
      });
      for (const [variantId, localized] of Object.entries(prices)) {
        const bucket = pricesByVariant.get(variantId);
        if (bucket) bucket[country] = localized;
      }
    }),
  );

  const products = [];
  let newVariants = 0;

  for (const id of knownIds) {
    const freshProduct = freshById.get(id);
    if (!freshProduct) continue; // deleted upstream — dropped, already warned above

    const existingProduct = existingById.get(id);
    if (!existingProduct) {
      // Genuinely unreachable: knownIds is built from existing.products.
      continue;
    }

    const existingVariantById = new Map(
      existingProduct.variants.map((v) => [v.id, v]),
    );
    const existingImageBySrc = new Map(
      (existingProduct.images ?? []).map((img) => [img.src, img]),
    );

    const rawVariants = freshProduct.variants?.nodes ?? [];
    const priced = rawVariants.filter((v) => v.price != null);
    const saleVariant = priced.find((v) => v.availableForSale) ?? priced[0];
    const price = saleVariant ? Number(saleVariant.price) : existingProduct.price;
    const compareRaw =
      saleVariant?.compareAtPrice != null ? Number(saleVariant.compareAtPrice) : null;
    const compareAtPrice = compareRaw != null && compareRaw > price ? compareRaw : null;

    const variants = priced.map((v) => {
      const curated = existingVariantById.get(v.id);
      if (!curated) {
        newVariants++;
        console.log(
          `  + new variant on "${freshProduct.title}": ${v.title} (${v.sku}) — using Shopify's raw title until curated`,
        );
      }
      const compare = v.compareAtPrice != null ? Number(v.compareAtPrice) : null;
      const variantPrice = Number(v.price);
      return {
        id: v.id,
        title: curated?.title ?? v.title,
        sku: v.sku,
        price: variantPrice,
        compareAtPrice: compare != null && compare > variantPrice ? compare : null,
        availableForSale: v.availableForSale,
        pricesByMarket: pricesByVariant.get(v.id) ?? {},
        image: v.image?.url ?? curated?.image ?? null,
        shopifyTitle: v.title,
        subtitle: curated?.subtitle ?? v.title,
        quantity: curated?.quantity ?? 1,
        weightGrams: curated?.weightGrams ?? 0,
      };
    });

    products.push({
      id: freshProduct.id,
      handle: freshProduct.handle,
      // Shopify's own product title on this shared/CJ-sourced store is not
      // fit to show a shopper directly (it can still say "tourmaline" on a
      // hematite product) — curated title is preserved, same as a variant's.
      title: existingProduct.title,
      shopifyTitle: freshProduct.title,
      price,
      compareAtPrice,
      currencyCode: currency,
      availableForSale: variants.some((v) => v.availableForSale),
      variants,
      images: (freshProduct.images?.nodes ?? []).map((img) =>
        toImage(img, freshProduct.title, existingImageBySrc),
      ),
      subtitle: existingProduct.subtitle,
      material: existingProduct.material,
      descriptionHtml: existingProduct.descriptionHtml,
      specs: existingProduct.specs,
    });
  }

  const record = {
    version: 5,
    syncedAt: new Date().toISOString(),
    shop: {
      domain: cfg.storeDomain,
      name: shopData?.shop?.name || existing.shop?.name || "HimVolt",
      currencyCode: currency,
    },
    markets,
    products,
  };

  const json = `${JSON.stringify(record, null, 2)}\n`;
  const tmp = `${OUTPUT}.tmp`;
  writeFileSync(tmp, json);
  renameSync(tmp, OUTPUT);

  console.log(`✔ wrote ${OUTPUT}`);
  console.log(
    `  ${products.length} product(s), ${products.reduce((n, p) => n + p.variants.length, 0)} variant(s), ${markets.length} market(s)${newVariants ? `, ${newVariants} new variant(s) need curated copy` : ""}`,
  );
}

main().catch((err) => {
  console.error("✖ sync failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
