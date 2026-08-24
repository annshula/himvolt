/**
 * `node scripts/sync-product.mjs` — refresh every product in data/product.json
 * from the Shopify Admin + Storefront APIs and overwrite the file.
 *
 * "Exactly the SKUs, no extra items": the set of products synced is driven
 * by the `id`s already present in data/product.json (a `nodes(ids: [...])`
 * lookup), never a title/SKU search — a search can silently match the wrong
 * product on a shared store. To add a sixth product, add its id/handle to
 * data/product.json by hand first (Shopify Admin holds everything else now);
 * the next sync fills in the rest. If Shopify no longer has one of the known
 * ids (deleted upstream), that product is dropped and the run says so loudly
 * rather than leaving a phantom listing in the file forever.
 *
 * Everything in a product/variant record is Shopify-sourced and overwritten
 * every run: title, descriptionHtml, subtitle (custom.subtitle metafield),
 * material (custom.material metafield), specs (custom.specs — a list of
 * Product spec metaobjects, label+value each), features (custom.
 * feature_highlights — a list of Feature highlight metaobjects, icon+label+
 * body each), images, variant sku/price/compareAtPrice/availableForSale/
 * image, pricesByMarket. Every one of those is editable from Shopify Admin
 * without touching this repo — that split (code vs. Shopify Admin) used to
 * run through this file as a curated/Shopify-sourced distinction per field;
 * it doesn't need to anymore, now that Shopify's own title/description on
 * this store no longer say "tourmaline" on a hematite product. Only two
 * things still fall back to whatever was already in the file instead of
 * wiping it out on a bad read: a variant's display `title`/`subtitle` (a
 * cleaned-up name vs. Shopify's raw "Golden Hematite Bracelet / 10mm"-style
 * option string — Shopify has no per-variant equivalent of a metafield-
 * backed display name) and any of the metaobject-backed fields when the
 * metafield comes back empty (a merchant clearing a field in Admin shouldn't
 * delete the content, just leave it stale until it's replaced).
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
      descriptionHtml
      subtitleField: metafield(namespace: "custom", key: "subtitle") { value }
      materialField: metafield(namespace: "custom", key: "material") { value }
      specsField: metafield(namespace: "custom", key: "specs") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              label: field(key: "label") { value }
              value: field(key: "value") { value }
              description: field(key: "description") { value }
              image: field(key: "image") {
                reference {
                  ... on MediaImage {
                    image { url altText width height }
                  }
                }
              }
              video: field(key: "video") {
                reference {
                  ... on Video {
                    sources { url mimeType format width height }
                    preview { image { url width height } }
                  }
                }
              }
            }
          }
        }
      }
      featureHighlights: metafield(namespace: "custom", key: "feature_highlights") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              icon: field(key: "icon") { value }
              label: field(key: "label") { value }
              body: field(key: "body") { value }
              image: field(key: "image") {
                reference {
                  ... on MediaImage {
                    image { url altText width height }
                  }
                }
              }
              video: field(key: "video") {
                reference {
                  ... on Video {
                    sources { url mimeType format width height }
                    preview { image { url width height } }
                  }
                }
              }
            }
          }
        }
      }
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

/** Reads a metaobject-reference list's nodes into an array shaped by `pick`, dropping any entry missing one of `requiredKeys` (usually label/value or icon/label/body — text fields with no sane default), or null if nothing survives (never crash the sync, or wipe out existing content, over a merchant leaving a field blank). Optional keys like `description`/`image` pass through as whatever `pick` returns for them, string or object or undefined. */
function parseMetaobjectList(referencesNodes, requiredKeys, pick) {
  if (!referencesNodes || referencesNodes.length === 0) return null;
  const items = referencesNodes
    .filter((n) => n != null)
    .map((n) => pick(n))
    .filter((item) => requiredKeys.every((k) => typeof item[k] === "string"));
  return items.length > 0 ? items : null;
}

/** A file_reference metaobject field's MediaImage, in the same {src,alt,width,height} shape as the product gallery — or null if the merchant hasn't picked an image for this entry yet. */
function toEntryImage(field, fallbackAlt) {
  const img = field?.reference?.image;
  if (!img) return null;
  return { src: img.url, alt: img.altText ?? fallbackAlt, width: img.width, height: img.height };
}

/** A file_reference metaobject field's Video, in the {poster, sources} shape ParallaxBenefit's media prop expects — or null if the merchant hasn't attached a video to this entry. Shopify auto-transcodes an upload into several mp4 renditions plus an HLS (.m3u8) stream; only the mp4 ones go in `sources` since a plain <video> element can't play HLS without extra JS, sorted HD-first so the browser's first-playable-source pick is the best one. */
function toEntryVideo(field) {
  const video = field?.reference;
  if (!video || !video.sources?.length) return null;
  const mp4 = video.sources
    .filter((s) => s.mimeType === "video/mp4")
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  if (mp4.length === 0) return null;
  return {
    poster: video.preview?.image?.url ?? "",
    sources: mp4.map((s) => ({ src: s.url, type: s.mimeType })),
  };
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
      `✖ ${OUTPUT} does not exist — this script refreshes known products, it doesn't create the catalog from scratch. Seed it with at least one product's id/handle first.`,
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
        // A variant has no metafield-backed display name of its own, so this
        // is still the one field preserved rather than pulled from Shopify —
        // its raw option string ("Golden Hematite Bracelet / 10mm") would
        // break the site's swatch-parsing, which expects "Gold-plated · 10mm".
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

    const specs =
      parseMetaobjectList(freshProduct.specsField?.references?.nodes, ["label", "value"], (n) => ({
        label: n.label?.value,
        value: n.value?.value,
        description: n.description?.value || undefined,
        image: toEntryImage(n.image, freshProduct.title),
        video: toEntryVideo(n.video),
      })) ?? existingProduct.specs ?? [];

    const features =
      parseMetaobjectList(freshProduct.featureHighlights?.references?.nodes, ["icon", "label", "body"], (n) => ({
        icon: n.icon?.value,
        label: n.label?.value,
        body: n.body?.value,
        image: toEntryImage(n.image, freshProduct.title),
        video: toEntryVideo(n.video),
      })) ?? existingProduct.features ?? [];

    products.push({
      id: freshProduct.id,
      handle: freshProduct.handle,
      title: freshProduct.title,
      price,
      compareAtPrice,
      currencyCode: currency,
      availableForSale: variants.some((v) => v.availableForSale),
      variants,
      images: (freshProduct.images?.nodes ?? []).map((img) =>
        toImage(img, freshProduct.title, existingImageBySrc),
      ),
      subtitle: freshProduct.subtitleField?.value ?? existingProduct.subtitle ?? "",
      material: freshProduct.materialField?.value ?? existingProduct.material ?? "",
      descriptionHtml: freshProduct.descriptionHtml ?? existingProduct.descriptionHtml ?? "",
      specs,
      features,
    });
  }

  const record = {
    version: 8,
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
