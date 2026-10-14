/**
 * Loads the Shopify-synced catalog (data/product.json) and exposes live
 * prices in cents plus real variant ids for the UI, across every product
 * this store sells — not just one.
 *
 * The catalog file is produced by `node scripts/sync-product.mjs` (currently
 * still single-product — see that script's own note) or hand-verified
 * against live Shopify data — it is a read model only. At buy time the price
 * is re-validated against Shopify's Storefront API, never trusted from this
 * file. The variant ids here are the ground truth for cart lines and for
 * telling our line items apart from other brands sharing the Shopify store.
 */

import catalog from "@/data/product.json";
import type { Variant } from "@/lib/product";

export type SyncedImage = { src: string; alt: string; width: number; height: number };
export type SyncedVideo = { poster: string; sources: { src: string; type: string }[] };

export type SyncedVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
  /** Real Shopify inventory count, only when Shopify is tracking it for this variant — null for untracked variants or a product synced before this field existed. Never fabricated. */
  stockQuantity?: number | null;
  /** The real Shopify variant image (per finish/colour) — undefined for a product synced before images were added to the schema. */
  image?: string;
};

export type SyncedProduct = {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  currencyCode: string;
  availableForSale: boolean;
  variants: SyncedVariant[];
  /** The real Shopify product gallery — undefined for a product synced before images were added to the schema. */
  images?: SyncedImage[];
  /** The custom.available_countries Shopify metafield — ISO codes the product may be bought from; empty/undefined means everywhere. */
  availableCountries?: string[];
  /** The custom.feature_highlights Shopify metafield — merchant-editable in Shopify Admin, undefined for a product synced before this field existed. */
  features?: { icon: string; label: string; body: string; image?: SyncedImage | null; video?: SyncedVideo | null }[];
  /** The custom.specs Shopify metafield — undefined for a product synced before this field existed. */
  specs?: { label: string; value: string; description?: string; image?: SyncedImage | null; video?: SyncedVideo | null }[];
};

export const syncedProducts: SyncedProduct[] = catalog.products;
export const syncedShop = catalog.shop;
export const syncedAt = catalog.syncedAt;

/** The main/hero product — its own page is the one every "shop now" CTA elsewhere on the site hands off to. */
export const mainSyncedProduct = syncedProducts[0];
/** `mainSyncedProduct`'s URL — every generic CTA link should use this, not a hardcoded slug. */
export const productPath = `/products/${mainSyncedProduct.handle}`;
export function pathForHandle(handle: string) {
  return `/products/${handle}`;
}

export function getSyncedProductByHandle(handle: string): SyncedProduct | null {
  return syncedProducts.find((p) => p.handle === handle) ?? null;
}

const variantIndex = new Map<string, { product: SyncedProduct; variant: SyncedVariant }>();
for (const product of syncedProducts) {
  for (const variant of product.variants) {
    variantIndex.set(variant.id, { product, variant });
  }
}

/** The synced variant for a Shopify variant id, or null when unknown. */
export function getVariantById(id: string): SyncedVariant | null {
  return variantIndex.get(id)?.variant ?? null;
}

/** Which synced product a Shopify variant id belongs to, or null when unknown. */
export function getProductForVariant(id: string): SyncedProduct | null {
  return variantIndex.get(id)?.product ?? null;
}

/** The default variant to buy from a product (first saleable). */
export function defaultVariant(product: SyncedProduct = mainSyncedProduct): SyncedVariant {
  return (
    product.variants.find((v) => v.availableForSale) ??
    product.variants[0] ??
    ({
      id: "",
      title: "Default Title",
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      availableForSale: product.availableForSale,
    } as SyncedVariant)
  );
}

/**
 * The base (shop-currency) price this file carries for the main product's
 * default variant, in cents. These are the values every page renders before
 * Shopify's live, country-specific price lands — nothing here is converted
 * or frozen per market; other currencies come from Shopify at request time
 * (app/api/localization/prices).
 */
const mainSaleVariant = defaultVariant(mainSyncedProduct);

export const productPriceCents = Math.round(mainSaleVariant.price * 100);
export const productCompareAtCents =
  mainSaleVariant.compareAtPrice != null
    ? Math.round(mainSaleVariant.compareAtPrice * 100)
    : productPriceCents;
export const productCurrency = mainSyncedProduct.currencyCode ?? "USD";

/**
 * Map a local presentation variant (from `lib/product.ts`) to its live
 * Shopify variant by id — both now carry the same real Shopify variant id
 * directly, so this is a straight lookup, not the old index-based join.
 */
export function liveVariantFor(local: Variant): SyncedVariant {
  return getVariantById(local.id) ?? defaultVariant();
}

/* ── Brand identity on a shared store ──────────────────────────────────── */

/** Every product this storefront sells — how we tell our line items apart from other brands sharing the Shopify store. */
export const himvoltProductIds = new Set(syncedProducts.map((p) => p.id));

/** Every variant of every one of our products; anything else on the shared store belongs to another brand. */
const himvoltVariantIds = new Set(
  syncedProducts.flatMap((p) => p.variants.map((v) => v.id)),
);

/**
 * Whether an order line item belongs to HimVolt. Matches the product id
 * first (any variant of one of our products counts, including a design
 * added after the last sync), falling back to the exact variant id set.
 */
export function belongsToHimVolt(input: {
  variantId?: string | null;
  productId?: string | null;
}): boolean {
  if (input.productId && himvoltProductIds.has(input.productId)) return true;
  return Boolean(input.variantId && himvoltVariantIds.has(input.variantId));
}

/**
 * The countries a variant's product may be bought from on the site (ISO
 * codes), or null when it is sold everywhere. Set per product in Shopify
 * (custom.available_countries).
 */
export function allowedCountriesForVariant(variantId: string): string[] | null {
  const list = getProductForVariant(variantId)?.availableCountries;
  return list && list.length > 0 ? list : null;
}
