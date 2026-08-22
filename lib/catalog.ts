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

export type SyncedVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
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

export const productPriceCents = Math.round(syncedProduct.price * 100);
export const productCompareAtCents =
  syncedProduct.compareAtPrice != null
    ? Math.round(syncedProduct.compareAtPrice * 100)
    : productPriceCents;
export const productCurrency = syncedProduct.currencyCode ?? "USD";

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
