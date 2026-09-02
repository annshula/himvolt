import "server-only";

import { sanitizeProductHtml } from "@/lib/sanitize-html";
import { CATALOG_PATH, acquireLock, readJsonFile, writeJsonFileAtomic } from "@/lib/catalog/storage";

import { graphqlRequest } from "@/lib/shopify/client";
import { getAdminToken } from "@/lib/shopify/admin-token";
import {
  adminEndpoint,
  isAdminConfigured,
  isStorefrontConfigured,
  shopifyConfig,
} from "@/lib/shopify/config";
import { getLocalizedVariantPrices } from "@/lib/shopify/localization-service";

/**
 * Multi-product Shopify sync — refreshes every product already in
 * data/product.json from live Shopify data. Two callers: `npm run
 * shopify:sync` (scripts/sync-product.mjs, its own standalone copy — see
 * that script's own note) and POST /api/admin/sync-product. Everything else
 * (product pages, shop listing, currency selector, cart) reads only
 * data/product.json, written here.
 *
 * "Exactly the SKUs, no extra items": which products get synced is driven
 * by the `id`s already present in the file (an Admin `nodes(ids:)` lookup),
 * never a title/SKU search — a search can silently match the wrong product
 * on a shared store. A known id Shopify no longer has (deleted upstream) is
 * dropped, not left behind as a phantom listing.
 *
 * Everything in a product/variant record is Shopify-sourced and overwritten
 * every run: title, descriptionHtml, subtitle (custom.subtitle metafield),
 * material (custom.material metafield), specs (custom.specs — a list of
 * Product spec metaobjects, label+value each), features (custom.
 * feature_highlights — a list of Feature highlight metaobjects, icon+label+
 * body each), images, variant sku/price/compareAtPrice/availableForSale/
 * image, pricesByMarket. Every one of those is editable from Shopify Admin
 * without touching this repo — that split used to run through this file as
 * a curated-vs-Shopify-sourced distinction per field; it doesn't need to
 * anymore, now that Shopify's own title/description on this store no longer
 * say "tourmaline" on a hematite product. Only two things still fall back to
 * whatever was already in the file instead of wiping it out on a bad read:
 * a variant's display title/subtitle (a cleaned-up name vs. Shopify's raw
 * "Golden Hematite Bracelet / 10mm"-style option string — Shopify has no
 * per-variant equivalent of a metafield-backed display name) and any of the
 * metaobject-backed fields when the metafield comes back empty (a merchant
 * clearing a field in Admin shouldn't delete the content, just leave it
 * stale until it's replaced).
 *
 * Two Shopify APIs, two jobs:
 *  - Admin API: the products themselves — id, handle, title, description,
 *    metafields, images, variants, base price.
 *  - Storefront API, once per real market: this store has genuinely
 *    distinct price lists for a handful of markets (found via Admin's
 *    `markets` query — a market scoped to exactly one country region is a
 *    real, merchant-configured market; one scoped to many is the
 *    "International" catch-all and is skipped, its price already covered by
 *    the base price). Freezing a snapshot only makes sense for markets with
 *    their own price list — the catch-all's price is live-FX-converted and
 *    would just go stale if snapshotted, so it isn't.
 */

const OUTPUT_PATH = CATALOG_PATH;

const SHOP_QUERY = /* GraphQL */ `
  query Shop {
    shop {
      name
      currencyCode
    }
  }
`;

const PRODUCTS_BY_ID_QUERY = /* GraphQL */ `
  query ProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        descriptionHtml
        subtitleField: metafield(namespace: "custom", key: "subtitle") {
          value
        }
        materialField: metafield(namespace: "custom", key: "material") {
          value
        }
        specsField: metafield(namespace: "custom", key: "specs") {
          references(first: 20) {
            nodes {
              ... on Metaobject {
                label: field(key: "label") {
                  value
                }
                value: field(key: "value") {
                  value
                }
                description: field(key: "description") {
                  value
                }
                image: field(key: "image") {
                  reference {
                    ... on MediaImage {
                      image {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                }
                video: field(key: "video") {
                  reference {
                    ... on Video {
                      sources {
                        url
                        mimeType
                        format
                        width
                        height
                      }
                      preview {
                        image {
                          url
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        featureHighlights: metafield(
          namespace: "custom"
          key: "feature_highlights"
        ) {
          references(first: 10) {
            nodes {
              ... on Metaobject {
                icon: field(key: "icon") {
                  value
                }
                label: field(key: "label") {
                  value
                }
                body: field(key: "body") {
                  value
                }
                image: field(key: "image") {
                  reference {
                    ... on MediaImage {
                      image {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                }
                video: field(key: "video") {
                  reference {
                    ... on Video {
                      sources {
                        url
                        mimeType
                        format
                        width
                        height
                      }
                      preview {
                        image {
                          url
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        images(first: 20) {
          nodes {
            url
            altText
            width
            height
          }
        }
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
            image {
              url
              altText
              width
              height
            }
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

type ImageNode = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

type VariantNode = {
  id: string;
  title: string;
  sku: string;
  price: string | null;
  compareAtPrice: string | null;
  availableForSale: boolean;
  inventoryQuantity: number | null;
  image: ImageNode | null;
};

type MetaobjectImageField = {
  reference: { image: ImageNode } | null;
} | null;

type VideoSourceNode = {
  url: string;
  mimeType: string;
  format: string;
  width: number | null;
  height: number | null;
};

type MetaobjectVideoField = {
  reference: {
    sources: VideoSourceNode[];
    preview: { image: { url: string; width: number; height: number } } | null;
  } | null;
} | null;

type FeatureHighlightNode = {
  icon: { value: string } | null;
  label: { value: string } | null;
  body: { value: string } | null;
  image: MetaobjectImageField;
  video: MetaobjectVideoField;
};

type SpecNode = {
  label: { value: string } | null;
  value: { value: string } | null;
  description: { value: string } | null;
  image: MetaobjectImageField;
  video: MetaobjectVideoField;
};

type MediaNode =
  | { __typename: "MediaImage"; image: ImageNode | null }
  | {
      __typename: "Video";
      sources: {
        url: string;
        mimeType: string;
        format: string;
        width: number | null;
        height: number | null;
      }[];
      preview: { image: { url: string; width: number; height: number } } | null;
    };

type ProductNode = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string | null;
  subtitleField: { value: string } | null;
  materialField: { value: string } | null;
  specsField: { references: { nodes: SpecNode[] } | null } | null;
  featureHighlights: {
    references: { nodes: FeatureHighlightNode[] } | null;
  } | null;
  images: { nodes: ImageNode[] } | null;
  media: { nodes: MediaNode[] } | null;
  variants: { nodes: VariantNode[] } | null;
};

type MarketPrice = {
  amount: number;
  compareAtAmount: number | null;
  currencyCode: string;
};

type SyncedImage = { src: string; alt: string; width: number; height: number };

type SyncedVideo = { poster: string; sources: { src: string; type: string }[] };

/** One entry in the product's actual Shopify media order — images and videos interleaved exactly as merchandised in Admin, for the main gallery/carousel (ProductGallery). Distinct from `images` below, which stays images-only for consumers that can never sensibly land on a video (the listing card's cover photo, a spec/feature's image fallback, OG/meta tags). */
type SyncedMediaItem =
  | ({ kind: "image" } & SyncedImage)
  | ({ kind: "video" } & SyncedVideo);

type SyncedFeature = {
  icon: string;
  label: string;
  body: string;
  image?: SyncedImage | null;
  video?: SyncedVideo | null;
};

type SyncedSpec = {
  label: string;
  value: string;
  description?: string;
  image?: SyncedImage | null;
  video?: SyncedVideo | null;
};

type SyncedVariant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
  stockQuantity: number | null;
  pricesByMarket: Record<string, MarketPrice>;
  image: string | null;
  shopifyTitle: string;
  subtitle: string;
  quantity: number;
  weightGrams: number;
};

type SyncedProduct = {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  currencyCode: string;
  availableForSale: boolean;
  variants: SyncedVariant[];
  images: SyncedImage[];
  /** Undefined for a product synced before this field existed — see lib/product.ts's fallback to the images-only gallery. */
  media?: SyncedMediaItem[];
  subtitle: string;
  material: string;
  descriptionHtml: string;
  specs: SyncedSpec[];
  features: SyncedFeature[];
};

export type SyncedCatalogRecord = {
  version: 8;
  syncedAt: string;
  shop: { domain: string; name: string; currencyCode: string };
  markets: string[];
  products: SyncedProduct[];
};

/** Reads a metaobject-reference list's nodes into T[] via `pick`, dropping any entry missing one of `requiredKeys` (text fields with no sane default — usually label/value or icon/label/body), or null if nothing survives (never crash the sync, or wipe out existing content, over a merchant leaving a field blank). Optional keys like `description`/`image` pass through as whatever `pick` returns, string or object or undefined. */
function parseMetaobjectList<Node, T extends Record<string, unknown>>(
  nodes: Node[] | undefined,
  requiredKeys: (keyof T)[],
  pick: (node: NonNullable<Node>) => T,
): T[] | null {
  if (!nodes || nodes.length === 0) return null;
  const items = nodes
    .filter((n): n is NonNullable<Node> => n != null)
    .map(pick)
    .filter((item) => requiredKeys.every((k) => typeof item[k] === "string"));
  return items.length > 0 ? items : null;
}

/** A file_reference metaobject field's MediaImage, in the same {src,alt,width,height} shape as the product gallery — or null if the merchant hasn't picked an image for this entry yet. */
function toEntryImage(
  field: MetaobjectImageField,
  fallbackAlt: string,
): SyncedImage | null {
  const img = field?.reference?.image;
  if (!img) return null;
  return {
    src: img.url,
    alt: img.altText ?? fallbackAlt,
    width: img.width,
    height: img.height,
  };
}

/** A file_reference metaobject field's Video, in the {poster, sources} shape ParallaxBenefit's media prop expects — or null if the merchant hasn't attached a video to this entry. Shopify auto-transcodes an upload into several mp4 renditions plus an HLS (.m3u8) stream; only the mp4 ones go in `sources` since a plain <video> element can't play HLS without extra JS, sorted HD-first so the browser's first-playable-source pick is the best one. */
function toEntryVideo(field: MetaobjectVideoField): SyncedVideo | null {
  const video = field?.reference;
  if (!video || video.sources.length === 0) return null;
  const mp4 = video.sources
    .filter((s) => s.mimeType === "video/mp4")
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  if (mp4.length === 0) return null;
  return {
    poster: video.preview?.image.url ?? "",
    sources: mp4.map((s) => ({ src: s.url, type: s.mimeType })),
  };
}

/** The product's actual Shopify media list, images and videos interleaved in Admin's real order, in the shape ProductGallery expects. Skips a MediaImage with no image (still processing) or a Video with no playable mp4 source (HLS-only, before transcoding finishes) rather than erroring the whole sync. */
function toMediaItems(
  nodes: MediaNode[] | undefined,
  fallbackAlt: string,
  existingImageBySrc: Map<string, SyncedImage>,
): SyncedMediaItem[] {
  if (!nodes) return [];
  const items: SyncedMediaItem[] = [];
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
      const mp4 = node.sources
        .filter((s) => s.mimeType === "video/mp4")
        .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
      if (mp4.length === 0) continue;
      items.push({
        kind: "video",
        poster: node.preview?.image.url ?? "",
        sources: mp4.map((s) => ({ src: s.url, type: s.mimeType })),
      });
    }
  }
  return items;
}

/** Single-country markets are real, merchant-priced markets; multi-country ones are the "sell everywhere" catch-all. */
async function discoverCuratedMarketCountries(
  adminRequest: <T>(
    query: string,
    variables?: Record<string, unknown>,
  ) => Promise<T>,
): Promise<string[]> {
  const data = await adminRequest<{
    markets: {
      nodes: {
        name: string;
        enabled: boolean;
        regions: { nodes: { code?: string }[] };
      }[];
    };
  }>(MARKETS_QUERY);

  const codes = new Set<string>();
  for (const market of data.markets.nodes) {
    if (!market.enabled) continue;
    const regionCodes = market.regions.nodes
      .map((r) => r.code)
      .filter((c): c is string => Boolean(c));
    if (regionCodes.length === 1) codes.add(regionCodes[0]);
  }
  return [...codes];
}

/**
 * Refreshes every product already in data/product.json from live Shopify
 * data and overwrites the file. Throws on any failure — callers decide how
 * to report it.
 */
export async function syncAllProducts(): Promise<SyncedCatalogRecord> {
  const cfg = shopifyConfig();
  if (!cfg.storeDomain) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not set.");
  }
  if (!isAdminConfigured(cfg)) {
    throw new Error(
      "Shopify Admin API is not configured — set SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET (or SHOPIFY_ADMIN_API_TOKEN).",
    );
  }

  const existing = await readJsonFile<SyncedCatalogRecord>(OUTPUT_PATH);
  if (!existing) {
    throw new Error(
      `${OUTPUT_PATH} does not exist — this refreshes known products, it doesn't create the catalog from scratch. Seed it with at least one product's id/handle first.`,
    );
  }
  const knownIds = existing.products.map((p) => p.id);

  const endpoint = adminEndpoint(cfg);
  const adminToken = await getAdminToken();
  // The Admin API authenticates via X-Shopify-Access-Token, not a bearer
  // Authorization header (that header is Storefront/Customer Account only).
  const adminRequest = <T>(
    query: string,
    variables: Record<string, unknown> = {},
  ) =>
    graphqlRequest<T>({
      endpoint,
      query,
      variables,
      headers: { "X-Shopify-Access-Token": adminToken },
    });

  const [shopData, fresh] = await Promise.all([
    adminRequest<{ shop: { name: string; currencyCode: string } | null }>(
      SHOP_QUERY,
    ),
    adminRequest<{ nodes: (ProductNode | null)[] }>(PRODUCTS_BY_ID_QUERY, {
      ids: knownIds,
    }),
  ]);
  const currency =
    shopData.shop?.currencyCode || existing.shop?.currencyCode || "USD";

  const freshById = new Map(
    fresh.nodes
      .filter((p): p is ProductNode => p != null)
      .map((p) => [p.id, p]),
  );
  const existingById = new Map(existing.products.map((p) => [p.id, p]));

  for (const id of knownIds) {
    if (!freshById.has(id)) {
      console.error(
        `[sync] product ${id} (${existingById.get(id)?.handle}) no longer exists on Shopify — dropping it`,
      );
    }
  }

  // A permissions gap (e.g. the Admin app is missing the read_markets scope)
  // must not take down the base sync — just skip market prices.
  const markets = await discoverCuratedMarketCountries(adminRequest).catch(
    () => [],
  );

  const allVariantIds = [...freshById.values()].flatMap((p) =>
    (p.variants?.nodes ?? []).map((v) => v.id),
  );
  const pricesByVariant = new Map<string, Record<string, MarketPrice>>(
    allVariantIds.map((id) => [id, {}]),
  );

  if (markets.length > 0 && isStorefrontConfigured(cfg)) {
    await Promise.all(
      markets.map(async (country) => {
        const priceMap = await getLocalizedVariantPrices(
          allVariantIds,
          country,
        ).catch(() => new Map());
        for (const [variantId, localized] of priceMap) {
          const bucket = pricesByVariant.get(variantId);
          if (!bucket) continue;
          bucket[country] = {
            amount: Number(localized.amount),
            compareAtAmount:
              localized.compareAtAmount != null
                ? Number(localized.compareAtAmount)
                : null,
            currencyCode: localized.currencyCode,
          };
        }
      }),
    );
  }

  const products: SyncedProduct[] = [];

  for (const id of knownIds) {
    const freshProduct = freshById.get(id);
    if (!freshProduct) continue; // deleted upstream — dropped, already warned above
    const existingProduct = existingById.get(id)!;

    const existingVariantById = new Map(
      existingProduct.variants.map((v) => [v.id, v]),
    );
    const existingImageBySrc = new Map(
      existingProduct.images.map((img) => [img.src, img]),
    );

    const rawVariants = freshProduct.variants?.nodes ?? [];
    const priced = rawVariants.filter((v) => v.price != null);
    const saleVariant = priced.find((v) => v.availableForSale) ?? priced[0];
    const price = saleVariant
      ? Number(saleVariant.price)
      : existingProduct.price;
    const compareRaw =
      saleVariant?.compareAtPrice != null
        ? Number(saleVariant.compareAtPrice)
        : null;
    const compareAtPrice =
      compareRaw != null && compareRaw > price ? compareRaw : null;

    const variants: SyncedVariant[] = priced.map((v) => {
      const curated = existingVariantById.get(v.id);
      const variantPrice = Number(v.price);
      const compare =
        v.compareAtPrice != null ? Number(v.compareAtPrice) : null;
      return {
        id: v.id,
        // A variant has no metafield-backed display name of its own, so this
        // is still the one field preserved rather than pulled from Shopify —
        // its raw option string ("Golden Hematite Bracelet / 10mm") would
        // break the site's swatch-parsing, which expects "Gold-plated · 10mm".
        title: curated?.title ?? v.title,
        sku: v.sku,
        price: variantPrice,
        compareAtPrice:
          compare != null && compare > variantPrice ? compare : null,
        availableForSale: v.availableForSale,
        // Only meaningful when Shopify is actually tracking inventory for
        // this variant — untracked variants report a large/negative
        // placeholder, not a real count, so null it out rather than show a
        // nonsense number.
        stockQuantity:
          typeof v.inventoryQuantity === "number" && v.inventoryQuantity >= 0
            ? v.inventoryQuantity
            : null,
        pricesByMarket: pricesByVariant.get(v.id) ?? {},
        image: v.image?.url ?? curated?.image ?? null,
        shopifyTitle: v.title,
        subtitle: curated?.subtitle ?? v.title,
        quantity: curated?.quantity ?? 1,
        weightGrams: curated?.weightGrams ?? 0,
      };
    });

    const specs =
      parseMetaobjectList(
        freshProduct.specsField?.references?.nodes,
        ["label", "value"],
        (n: SpecNode) => ({
          label: n.label?.value,
          value: n.value?.value,
          description: n.description?.value || undefined,
          image: toEntryImage(n.image, freshProduct.title),
          video: toEntryVideo(n.video),
        }),
      ) ??
      existingProduct.specs ??
      [];

    const features =
      parseMetaobjectList(
        freshProduct.featureHighlights?.references?.nodes,
        ["icon", "label", "body"],
        (n: FeatureHighlightNode) => ({
          icon: n.icon?.value,
          label: n.label?.value,
          body: n.body?.value,
          image: toEntryImage(n.image, freshProduct.title),
          video: toEntryVideo(n.video),
        }),
      ) ??
      existingProduct.features ??
      [];

    products.push({
      id: freshProduct.id,
      handle: freshProduct.handle,
      title: freshProduct.title,
      price,
      compareAtPrice,
      currencyCode: currency,
      availableForSale: variants.some((v) => v.availableForSale),
      variants,
      images: (freshProduct.images?.nodes ?? []).map((img) => ({
        src: img.url,
        // Shopify's own altText on this store is a meaningless upload
        // hash — keep the hand-written alt for this exact image if we
        // already had one, otherwise fall back to the product title.
        alt: existingImageBySrc.get(img.url)?.alt ?? freshProduct.title,
        width: img.width,
        height: img.height,
      })),
      media: toMediaItems(
        freshProduct.media?.nodes,
        freshProduct.title,
        existingImageBySrc,
      ),
      subtitle:
        freshProduct.subtitleField?.value ?? existingProduct.subtitle ?? "",
      material:
        freshProduct.materialField?.value ?? existingProduct.material ?? "",
      // Description HTML is merchant-controlled (shared Shopify store) and is
      // rendered through dangerouslySetInnerHTML on product pages — sanitize it
      // once here at the source so the catalog never carries executable markup.
      descriptionHtml: sanitizeProductHtml(
        freshProduct.descriptionHtml ?? existingProduct.descriptionHtml ?? "",
      ),
      specs: specs as SyncedSpec[],
      features: features as SyncedFeature[],
    });
  }

  const record: SyncedCatalogRecord = {
    version: 8,
    syncedAt: new Date().toISOString(),
    shop: {
      domain: cfg.storeDomain,
      name: shopData.shop?.name || existing.shop?.name || "HimVolt",
      currencyCode: currency,
    },
    markets,
    products,
  };

  // Locked, atomic write — a crash mid-write must never leave data/product.json
  // truncated, and two syncs racing must never interleave their writes.
  const lock = await acquireLock();
  try {
    await writeJsonFileAtomic(OUTPUT_PATH, record);
  } finally {
    await lock.release();
  }

  return record;
}

/**
 * Ensures a Shopify product id exists in data/product.json so a following
 * syncAllProducts() includes it. syncAllProducts() only refreshes ids already
 * present in the file, so a products/create webhook must seed the new id here
 * first. Still "Exactly the SKUs" — only the exact id the webhook named is
 * ever added, never a title/SKU search that could match the wrong product on
 * a shared store. Returns whether the product was already present.
 */
export async function seedProductIntoCatalog(
  productId: string,
  fallback: { title?: string; handle?: string } = {},
): Promise<{ existed: boolean }> {
  const lock = await acquireLock();
  try {
    // Re-read inside the lock: another writer may have persisted since any
    // earlier read this caller did.
    const record = await readJsonFile<SyncedCatalogRecord>(OUTPUT_PATH);
    if (!record) {
      throw new Error(
        `${OUTPUT_PATH} does not exist — this seeds known products, it can't create the catalog from scratch.`,
      );
    }
    if (record.products.some((p) => p.id === productId)) return { existed: true };

    // Every field is a placeholder — the following syncAllProducts() overwrites
    // everything from Shopify (title, handle, price, variants, images, …). Only
    // the id matters here; the fallback title/handle are just for readable logs.
    record.products.push({
      id: productId,
      handle: fallback.handle ?? "",
      title: fallback.title ?? "",
      price: 0,
      compareAtPrice: null,
      currencyCode: record.shop.currencyCode ?? "USD",
      availableForSale: false,
      variants: [],
      images: [],
      media: [],
      subtitle: "",
      material: "",
      descriptionHtml: "",
      specs: [],
      features: [],
    });

    await writeJsonFileAtomic(OUTPUT_PATH, record);
    return { existed: false };
  } finally {
    await lock.release();
  }
}

export type ProductWebhookSyncResult = {
  action: "synced" | "added-and-synced";
  handle: string | null;
  products: number;
};

/**
 * Webhook entry point for products/create + products/update: makes sure the
 * named product is in the catalog (seeding it on create), then refreshes the
 * whole file from Shopify. A full sync (not a single-product fetch) is used
 * deliberately — it's the same job POST /api/admin/sync-product does, reuses
 * the one tested code path, and keeps the file internally consistent (shared
 * store, shared market prices).
 */
export async function syncProductFromWebhook(
  productId: string | number,
  fallback: { title?: string; handle?: string } = {},
): Promise<ProductWebhookSyncResult> {
  const gid = String(productId).startsWith("gid://")
    ? String(productId)
    : `gid://shopify/Product/${String(productId).split("/").pop()}`;

  const { existed } = await seedProductIntoCatalog(gid, fallback);
  const record = await syncAllProducts();
  return {
    action: existed ? "synced" : "added-and-synced",
    handle: fallback.handle ?? null,
    products: record.products.length,
  };
}
