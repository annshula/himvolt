/**
 * `node scripts/sync-product.mjs` — refresh every product in data/product.json
 * from the Shopify Admin API and overwrite the file.
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
 * image. Every one of those is editable from Shopify Admin
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
 * Prices are NOT frozen per market here. The file holds each variant's base
 * (shop-currency) price only; every other currency is fetched live from
 * Shopify's Storefront API with `@inContext(country:)` at request time
 * (app/api/localization/prices), and checkout is created for the same
 * country, so the site and checkout can never disagree.
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

const SHOP_QUERY = `query { shop { name currencyCode } }`;

const PRODUCTS_BY_ID_QUERY = `
query ProductsByIds($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      handle
      title
      descriptionHtml
      seo { title description }
      subtitleField: metafield(namespace: "custom", key: "subtitle") { value }
      materialField: metafield(namespace: "custom", key: "material") { value }
      perksField: metafield(namespace: "custom", key: "perks") { value }
      saleEndsAtField: metafield(namespace: "custom", key: "sale_ends_at") { value }
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
      media(first: 20) {
        nodes {
          __typename
          ... on MediaImage {
            image { url altText width height }
          }
          ... on Video {
            sources { url mimeType format width height }
            preview { image { url width height } }
          }
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          sku
          price
          compareAtPrice
          availableForSale
          inventoryQuantity
          image { url altText width height }
        }
      }
    }
  }
}`;

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

/** The product's actual Shopify media list, images and videos interleaved in Admin's real order, in the shape ProductGallery expects. Skips a MediaImage with no image (still processing) or a Video with no playable mp4 source (HLS-only, before transcoding finishes) rather than erroring the whole sync. */
function toMediaItems(nodes, fallbackAlt, existingImageBySrc) {
  if (!nodes) return [];
  const items = [];
  for (const node of nodes) {
    if (node.__typename === "MediaImage") {
      const img = node.image;
      if (!img) continue;
      items.push({
        kind: "image",
        src: img.url,
        alt: existingImageBySrc.get(img.url)?.alt ?? img.altText ?? fallbackAlt,
        width: img.width,
        height: img.height,
      });
    } else if (node.__typename === "Video") {
      const mp4 = (node.sources ?? [])
        .filter((s) => s.mimeType === "video/mp4")
        .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
      if (mp4.length === 0) continue;
      items.push({
        kind: "video",
        poster: node.preview?.image?.url ?? "",
        sources: mp4.map((s) => ({ src: s.url, type: s.mimeType })),
      });
    }
  }
  return items;
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

/** custom.perks — a list.single_line_text_field metafield, stored by Shopify as a JSON array of strings. */
function normalizePerks(field) {
  if (!field?.value) return [];
  try {
    const list = JSON.parse(field.value);
    if (!Array.isArray(list)) return [];
    return list.filter((p) => typeof p === "string" && p.trim().length > 0).map((p) => p.trim());
  } catch {
    return [];
  }
}

/** custom.sale_ends_at — only kept when it's a valid timestamp that hasn't passed yet, so an expired countdown never reaches the page. The page re-checks against the visitor's clock too, since a catalog snapshot can be hours old. */
function normalizeSaleEndsAt(field) {
  const raw = field?.value?.trim();
  if (!raw) return null;
  const time = Date.parse(raw);
  if (Number.isNaN(time) || time <= Date.now()) return null;
  return new Date(time).toISOString();
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
        // Only meaningful when Shopify is actually tracking inventory for
        // this variant — untracked variants report a large/negative
        // placeholder, not a real count, so null it out rather than show a
        // nonsense number.
        stockQuantity:
          typeof v.inventoryQuantity === "number" && v.inventoryQuantity >= 0
            ? v.inventoryQuantity
            : null,
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
      media: toMediaItems(freshProduct.media?.nodes, freshProduct.title, existingImageBySrc),
      subtitle: freshProduct.subtitleField?.value ?? existingProduct.subtitle ?? "",
      material: freshProduct.materialField?.value ?? existingProduct.material ?? "",
      seoTitle: freshProduct.seo?.title?.trim() || null,
      seoDescription: freshProduct.seo?.description?.trim() || null,
      perks: normalizePerks(freshProduct.perksField),
      saleEndsAt: normalizeSaleEndsAt(freshProduct.saleEndsAtField),
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
    products,
  };

  const json = `${JSON.stringify(record, null, 2)}\n`;
  const tmp = `${OUTPUT}.tmp`;
  writeFileSync(tmp, json);
  renameSync(tmp, OUTPUT);

  console.log(`✔ wrote ${OUTPUT}`);
  console.log(
    `  ${products.length} product(s), ${products.reduce((n, p) => n + p.variants.length, 0)} variant(s)${newVariants ? `, ${newVariants} new variant(s) need curated copy` : ""}`,
  );
}

main().catch((err) => {
  console.error("✖ sync failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
