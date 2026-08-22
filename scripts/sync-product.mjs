/**
 * `node scripts/sync-product.mjs [handle]` — fetch the HimVolt product from the
 * Shopify Admin API and write data/product.json with its live price, compare-at
 * price and real variant ids (in dollars).
 *
 * The Admin access token is generated at runtime via the client-credentials
 * grant (Client ID + Secret → 24h token) — never passed in directly.
 *
 * Default handle: the-tourmaline-band. If no product matches the handle, the
 * script falls back to a title / SKU search so the single HimVolt product can
 * be found even when its handle differs on the shared store.
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

const endpoint = `https://${cfg.storeDomain}/admin/api/${cfg.apiVersion}/graphql.json`;

async function adminRequest(query, variables = {}) {
  const token = await getAdminToken();
  const res = await fetch(endpoint, {
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

const SHOP_QUERY = `query { shop { name currencyCode } }`;
const PRODUCT_BY_HANDLE = `
query ProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id handle title
    variants(first: 100) { nodes { id title price compareAtPrice availableForSale } }
  }
}`;
const PRODUCT_SEARCH = `
query ProductSearch($query: String!) {
  products(first: 5, query: $query) {
    nodes {
      id handle title
      variants(first: 100) { nodes { id title price compareAtPrice availableForSale } }
    }
  }
}`;

function normalizeVariants(nodes) {
  return nodes
    .filter((v) => v.price != null)
    .map((v) => {
      const price = Number(v.price);
      const compare =
        v.compareAtPrice != null ? Number(v.compareAtPrice) : null;
      return {
        id: v.id,
        title: v.title,
        price,
        compareAtPrice: compare != null && compare > price ? compare : null,
        availableForSale: v.availableForSale,
      };
    });
}

async function main() {
  const handle = process.argv[2] ?? "the-tourmaline-band";
  console.log(`· syncing product "${handle}" from ${cfg.storeDomain}`);

  const shopData = await adminRequest(SHOP_QUERY);
  let product =
    (await adminRequest(PRODUCT_BY_HANDLE, { handle }))?.productByHandle ??
    null;

  if (!product) {
    console.log(
      `· no product with handle "${handle}" — searching by title/SKU…`,
    );
    const search = await adminRequest(PRODUCT_SEARCH, {
      query: "title:*tourmaline* OR sku:CJSL2782*",
    });
    product = search?.products?.nodes?.[0] ?? null;
    if (product)
      console.log(`· matched "${product.title}" (${product.handle})`);
  }

  if (!product) {
    console.error("✖ no HimVolt product found on this store");
    process.exit(1);
  }

  const variants = normalizeVariants(product.variants?.nodes ?? []);
  const saleVariant = variants.find((v) => v.availableForSale) ?? variants[0];
  const price = saleVariant?.price ?? null;
  const compare = saleVariant?.compareAtPrice ?? null;
  const currency = shopData?.shop?.currencyCode || "USD";

  if (price == null) {
    console.error("✖ product has no priced, saleable variant");
    process.exit(1);
  }

  const record = {
    version: 2,
    syncedAt: new Date().toISOString(),
    shop: {
      domain: cfg.storeDomain,
      name: shopData?.shop?.name || "HimVolt",
      currencyCode: currency,
    },
    product: {
      id: product.id,
      handle: product.handle,
      title: product.title,
      price,
      compareAtPrice: compare != null && compare > price ? compare : null,
      currencyCode: currency,
      availableForSale: variants.some((v) => v.availableForSale),
      variants,
    },
  };

  const json = `${JSON.stringify(record, null, 2)}\n`;
  const tmp = `${OUTPUT}.tmp`;
  writeFileSync(tmp, json);
  renameSync(tmp, OUTPUT);

  console.log(`✔ wrote ${OUTPUT}`);
  console.log(
    `  ${product.title} → $${price}${record.product.compareAtPrice ? ` (was $${record.product.compareAtPrice})` : ""} ${currency} · ${variants.length} variants`,
  );
}

main().catch((err) => {
  console.error("✖ sync failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
