/**
 * Loads the Shopify-synced product record (data/product.json) and exposes the
 * live price / compare-at price in cents plus the real variant ids for the UI.
 *
 * The catalog file is produced by `node scripts/sync-product.mjs` — it is a
 * read model only. At buy time the price is re-validated against Shopify's
 * Storefront API, never trusted from this file. The variant ids here are the
 * ground truth for cart lines and for telling our line items apart from other
 * brands sharing the Shopify store.
 */

import catalog from "@/data/product.json";
import type { Variant } from "@/lib/product";

export type MarketPrice = {
  amount: number;
  compareAtAmount: number | null;
  currencyCode: string;
};

export type SyncedVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
  /** Per-country price list, from the store's real (single-country) Shopify Markets only — see lib/shopify/sync-product.ts. */
  pricesByMarket?: Record<string, MarketPrice>;
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
};

export const syncedProduct: SyncedProduct = catalog.product;
export const syncedShop = catalog.shop;
export const syncedAt = catalog.syncedAt;
/** The one product page's URL — every link on the site should use this, not a hardcoded slug, since the handle is whatever Shopify currently has it as. */
export const productPath = `/products/${syncedProduct.handle}`;
/** Curated market country codes this catalog has real per-market prices for (empty on older/unsynced data). */
export const syncedMarkets: string[] = "markets" in catalog ? catalog.markets : [];

const saleVariant =
  syncedProduct.variants.find((v) => v.availableForSale) ??
  syncedProduct.variants[0];
// Same US-preferred fallback as priceForMarket — the site's one "no country
// known yet" price should never be the raw Admin default (see priceForMarket).
const defaultPrice = saleVariant?.pricesByMarket?.US ?? {
  amount: syncedProduct.price,
  compareAtAmount: syncedProduct.compareAtPrice,
  currencyCode: syncedProduct.currencyCode,
};

export const productPriceCents = Math.round(defaultPrice.amount * 100);
export const productCompareAtCents =
  defaultPrice.compareAtAmount != null
    ? Math.round(defaultPrice.compareAtAmount * 100)
    : productPriceCents;
export const productCurrency = defaultPrice.currencyCode ?? "USD";

/** The default Shopify variant to buy from (first saleable). */
export function defaultVariant(): SyncedVariant {
  return (
    syncedProduct.variants.find((v) => v.availableForSale) ??
    syncedProduct.variants[0] ??
    ({
      id: "",
      title: "Default Title",
      price: syncedProduct.price,
      compareAtPrice: syncedProduct.compareAtPrice,
      availableForSale: syncedProduct.availableForSale,
    } as SyncedVariant)
  );
}

const byId = new Map(syncedProduct.variants.map((v) => [v.id, v] as const));

/** The synced variant for a Shopify variant id, or null when unknown. */
export function getVariantById(id: string): SyncedVariant | null {
  return byId.get(id) ?? null;
}

/**
 * A variant's price for a given country, straight from the synced catalog —
 * no live Shopify call. The store's "International" market (everywhere
 * outside AU/CA/GB) has no price list of its own — it's meant to mirror the
 * United States market — so any country outside the curated set falls back
 * to the US market's price, not the raw Admin default (a different, lower
 * number: this store's base/default price context, not a real retail price).
 * The raw default is only the last resort, for the rare case the sync ran
 * without Storefront access and no per-market prices exist at all.
 */
export function priceForMarket(
  variantId: string,
  countryCode: string | null | undefined,
): MarketPrice {
  const variant = getVariantById(variantId);
  const rawDefault: MarketPrice = {
    amount: variant?.price ?? syncedProduct.price,
    compareAtAmount: variant?.compareAtPrice ?? syncedProduct.compareAtPrice,
    currencyCode: syncedProduct.currencyCode,
  };
  if (!variant) return rawDefault;

  const us = variant.pricesByMarket?.US ?? rawDefault;
  if (!countryCode) return us;
  return variant.pricesByMarket?.[countryCode.toUpperCase()] ?? us;
}

/**
 * Map a local presentation variant (from `lib/product.ts`) to its live
 * Shopify variant by index/SKU, so the UI can hand real ids to the cart.
 */
export function liveVariantFor(local: Variant): SyncedVariant {
  const bySku = syncedProduct.variants.find(
    (v) => v.title === local.title || v.title.endsWith(local.title),
  );
  return bySku ?? defaultVariant();
}

/** Convenience re-export for the landing page model. */

/* ── Brand identity on a shared store ──────────────────────────────────── */

/** The single product this storefront sells — how we tell our line items apart from other brands sharing the Shopify store. */
export const himvoltProductId = syncedProduct.id;

/** Every variant of that product; anything else on the shared store belongs to another brand. */
const himvoltVariantIds = new Set(
  syncedProduct.variants.map((variant) => variant.id),
);

/**
 * Whether an order line item belongs to HimVolt. Matches the product id
 * first (any variant of our product counts, including a design added after the
 * last sync), falling back to the exact variant id set.
 */
export function belongsToHimVolt(input: {
  variantId?: string | null;
  productId?: string | null;
}): boolean {
  if (input.productId && input.productId === himvoltProductId) return true;
  return Boolean(input.variantId && himvoltVariantIds.has(input.variantId));
}
