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

export type MarketPrice = {
  amount: number;
  compareAtAmount: number | null;
  currencyCode: string;
};

export type SyncedImage = { src: string; alt: string; width: number; height: number };
export type SyncedVideo = { poster: string; sources: { src: string; type: string }[] };

export type SyncedVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
  /** Per-country price list, from the store's real (single-country) Shopify Markets only — see lib/shopify/sync-product.ts. Empty until a product has been through that sync. */
  pricesByMarket?: Record<string, MarketPrice>;
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
  /** The custom.feature_highlights Shopify metafield — merchant-editable in Shopify Admin, undefined for a product synced before this field existed. */
  features?: { icon: string; label: string; body: string; image?: SyncedImage | null; video?: SyncedVideo | null }[];
  /** The custom.specs Shopify metafield — undefined for a product synced before this field existed. */
  specs?: { label: string; value: string; description?: string; image?: SyncedImage | null; video?: SyncedVideo | null }[];
};

export const syncedProducts: SyncedProduct[] = catalog.products;
export const syncedShop = catalog.shop;
export const syncedAt = catalog.syncedAt;
/** Curated market country codes this catalog has real per-market prices for (empty until a product has been synced with Storefront access). */
export const syncedMarkets: string[] = "markets" in catalog ? catalog.markets : [];

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
 * A variant's price for a given country, straight from the synced catalog —
 * no live Shopify call. Products that haven't been through the per-market
 * sync (lib/shopify/sync-product.ts) simply have no pricesByMarket entries,
 * so every country falls back to the variant's own base price — correct
 * behavior, not a bug: there is nothing else to show yet.
 */
export function priceForMarket(
  variantId: string,
  countryCode: string | null | undefined,
): MarketPrice {
  const variant = getVariantById(variantId);
  const rawDefault: MarketPrice = {
    amount: variant?.price ?? mainSyncedProduct.price,
    compareAtAmount: variant?.compareAtPrice ?? mainSyncedProduct.compareAtPrice,
    currencyCode: mainSyncedProduct.currencyCode,
  };
  if (!variant) return rawDefault;

  const us = variant.pricesByMarket?.US ?? rawDefault;
  if (!countryCode) return us;
  return variant.pricesByMarket?.[countryCode.toUpperCase()] ?? us;
}

const mainSaleVariant = defaultVariant(mainSyncedProduct);
// Same US-preferred fallback as priceForMarket — the site's one "no country
// known yet" price should never be the raw Admin default.
const mainDefaultPrice = mainSaleVariant.pricesByMarket?.US ?? {
  amount: mainSaleVariant.price,
  compareAtAmount: mainSaleVariant.compareAtPrice,
  currencyCode: mainSyncedProduct.currencyCode,
};

export const productPriceCents = Math.round(mainDefaultPrice.amount * 100);
export const productCompareAtCents =
  mainDefaultPrice.compareAtAmount != null
    ? Math.round(mainDefaultPrice.compareAtAmount * 100)
    : productPriceCents;
export const productCurrency = mainDefaultPrice.currencyCode ?? "USD";

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
