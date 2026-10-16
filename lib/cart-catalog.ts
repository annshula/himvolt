/**
 * Client-safe bridge between the synced Shopify catalog (real variant ids +
 * base prices, data/product.json) and the local presentation model
 * (friendly titles + images, lib/product.ts) — across every product this
 * store sells.
 *
 * Both sides carry the same real Shopify variant id directly, so this is a
 * straight per-id join, not an index-based one. Nothing here imports
 * server-only modules — safe for the cart provider to use on the client.
 *
 * Prices here are the base (shop-currency) ones: the bag shows Shopify's live
 * price for the shopper's country on top (see components/cart/BagContents),
 * and checkout re-prices everything server-side.
 */

import catalog from "@/data/product.json";
import { packTiersFor, type PackTier } from "@/lib/pack-tiers";
import { products as localProducts } from "@/lib/product";

export type CartCatalogLine = {
  variantId: string;
  /** "Product title — Variant", for analytics. */
  name: string;
  /** The product's own title, for the bag line. */
  productName: string;
  /** The variant's label ("Black", "2 bracelets", "Gold-plated · 10mm"). */
  variantLabel: string;
  image: string;
  /** The product page, opened on this variant. */
  href: string;
  unitPriceCents: number;
  /** This variant's own compare-at price in cents, when Shopify has one above its price. */
  compareAtCents: number | null;
  /** Items the variant bundles (1 for a single). */
  units: number;
  /** True when the product's variants are pack sizes — buying more means picking a bigger pack on the product page, not a stepper. */
  hasPackOption: boolean;
  /** Quantity-break packs on this one variant (1 / 2 / 3 Pack), or null for an ordinary product. */
  tiers: PackTier[] | null;
};

const PACK_COUNT_RE = /\b(bracelets?|rings?|bands?|pieces?)\b/i;

const localVariantById = new Map(
  localProducts.flatMap((p) => p.variants.map((v) => [v.id, { variant: v, product: p }])),
);

const lineMap = new Map<string, CartCatalogLine>();

for (const product of catalog.products) {
  const local = localProducts.find((p) => p.id === product.id);
  const tiers = packTiersFor(product.handle);
  // "1 bracelet / 2 bracelets": every variant is a count of the product. A
  // quantity-break product is the same thing on one variant.
  const hasPackOption =
    tiers !== null ||
    (product.variants.length > 1 &&
      (local?.variants ?? []).length > 1 &&
      (local?.variants ?? []).every((v) => PACK_COUNT_RE.test(v.title)));

  for (const synced of product.variants) {
    const match = localVariantById.get(synced.id);
    const compareAt =
      synced.compareAtPrice != null && synced.compareAtPrice > synced.price
        ? Math.round(synced.compareAtPrice * 100)
        : null;
    lineMap.set(synced.id, {
      variantId: synced.id,
      name: match ? `${match.product.title} — ${match.variant.title}` : product.title,
      productName: match?.product.title ?? product.title,
      variantLabel: match?.variant.title ?? synced.title,
      image: match?.variant.image ?? match?.product.gallery?.[0]?.src ?? "",
      href: `/products/${product.handle}?variant=${synced.id.split("/").pop()}`,
      unitPriceCents: Math.round(synced.price * 100),
      compareAtCents: compareAt,
      units: Math.max(1, match?.variant.quantity ?? 1),
      hasPackOption,
      tiers,
    });
  }
}

/** Resolve a Shopify variant id to its presentable cart line, or null. */
export function resolveCartLine(variantId: string): CartCatalogLine | null {
  return lineMap.get(variantId) ?? null;
}

export function isKnownCartVariant(variantId: string): boolean {
  return lineMap.has(variantId);
}

/** Every known variant id, for localizing an entire cart at once. */
export const cartVariantIds = [...lineMap.keys()];
