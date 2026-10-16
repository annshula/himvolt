/**
 * `node scripts/sync-bump.mjs` — refresh data/bump.json, the one add-on product
 * offered inside the bag ("cart bump"), from the Shopify Admin API.
 *
 * It lives in its own file, not data/product.json, so it never shows up in the
 * shop grid, sitemap, llms.txt or as a product page — it is only sold from the
 * bag. lib/catalog.ts still indexes it, so cart validation, live prices and
 * the orders/paid webhook treat it as ours.
 *
 * Name, price, image and availability all come from Shopify; nothing about the
 * product is typed in here except which product it is (its handle).
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HANDLE =
  "resistance-bands-4-tube-yoga-pedal-puller-resistance-band-elastic-pull-rope-fitness-equipment-for-abdomen-waist-arm-training";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT = join(ROOT, "data", "bump.json");

function loadEnv() {
  const result = {};
  const path = join(ROOT, ".env");
  if (!existsSync(path)) return result;
  for (const line of readFileSync(path, "utf8").split("\n")) {
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

for (const [key, value] of Object.entries(loadEnv())) {
  if (process.env[key] === undefined) process.env[key] = value;
}

const storeDomain = (process.env.SHOPIFY_STORE_DOMAIN ?? "")
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");
const apiVersion = process.env.SHOPIFY_API_VERSION || "2026-07";

async function adminToken() {
  if (process.env.SHOPIFY_ADMIN_API_TOKEN) return process.env.SHOPIFY_ADMIN_API_TOKEN;
  const res = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SHOPIFY_ADMIN_CLIENT_ID ?? "",
      client_secret: process.env.SHOPIFY_ADMIN_CLIENT_SECRET ?? "",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `token request failed (HTTP ${res.status})`);
  }
  return data.access_token;
}

const QUERY = `
query Bump($query: String!) {
  shop { currencyCode }
  products(first: 1, query: $query) {
    nodes {
      id
      handle
      title
      images(first: 4) { nodes { url altText width height } }
      variants(first: 20) {
        nodes {
          id
          title
          sku
          price
          compareAtPrice
          availableForSale
          inventoryQuantity
          image { url }
        }
      }
    }
  }
}`;

async function main() {
  if (!storeDomain) throw new Error("SHOPIFY_STORE_DOMAIN is not set");
  const token = await adminToken();
  const res = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query: QUERY, variables: { query: `handle:${HANDLE}` } }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) throw new Error(body.errors?.[0]?.message || `HTTP ${res.status}`);

  const product = body.data.products.nodes.find((p) => p.handle === HANDLE);
  if (!product) throw new Error(`product "${HANDLE}" was not found on ${storeDomain}`);
  const currency = body.data.shop?.currencyCode || "USD";

  const images = product.images.nodes.map((img) => ({
    src: img.url,
    alt: img.altText || product.title,
    width: img.width ?? 0,
    height: img.height ?? 0,
  }));
  const variants = product.variants.nodes
    .filter((v) => v.price != null)
    .map((v) => {
      const price = Number(v.price);
      const compare = v.compareAtPrice != null ? Number(v.compareAtPrice) : null;
      return {
        id: v.id,
        title: v.title,
        sku: v.sku,
        price,
        compareAtPrice: compare != null && compare > price ? compare : null,
        availableForSale: v.availableForSale,
        stockQuantity:
          typeof v.inventoryQuantity === "number" && v.inventoryQuantity >= 0 ? v.inventoryQuantity : null,
        image: v.image?.url ?? images[0]?.src ?? null,
        shopifyTitle: v.title,
        subtitle: v.title,
        quantity: 1,
        weightGrams: 0,
      };
    });
  const first = variants.find((v) => v.availableForSale) ?? variants[0];

  const record = {
    version: 1,
    syncedAt: new Date().toISOString(),
    product: {
      id: product.id,
      handle: product.handle,
      title: product.title,
      price: first?.price ?? 0,
      compareAtPrice: first?.compareAtPrice ?? null,
      currencyCode: currency,
      availableForSale: variants.some((v) => v.availableForSale),
      variants,
      images,
    },
  };

  const tmp = `${OUTPUT}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(record, null, 2)}\n`);
  renameSync(tmp, OUTPUT);
  console.log(`✔ wrote ${OUTPUT}`);
  console.log(`  ${product.title}`);
  console.log(`  ${variants.length} variant(s), first ${first?.title} at ${first?.price} ${currency}`);
}

main().catch((err) => {
  console.error("✖ sync failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
