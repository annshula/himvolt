/**
 * Client-safe bridge between the synced Shopify catalog (real variant ids +
 * live prices, data/product.json) and the local presentation model
 * (friendly titles + images, lib/product.ts).
 *
 * Both lists are three entries in the same order (1 / 2 / 4 band packs), so
 * the presentation is joined to the synced ids by index. Nothing here imports
 * server-only modules — safe for the cart provider to use on the client.
 */

import catalog from "@/data/product.json";
import { product as localProduct } from "@/lib/product";

export type CartCatalogLine = {
  variantId: string;
  name: string;
  image: string;
  unitPriceCents: number;
};

const syncedVariants = catalog.product.variants;
const localVariants = localProduct.variants;

const lineMap = new Map<string, CartCatalogLine>();

syncedVariants.forEach((synced, index) => {
  const local = localVariants[index];
  lineMap.set(synced.id, {
    variantId: synced.id,
    name: local?.title ?? "The Tourmaline Band",
    image:
      local?.image ??
      localProduct.gallery[0]?.src ??
      "/product/cutout/single.png",
    unitPriceCents: Math.round(synced.price * 100),
  });
});

/** Resolve a Shopify variant id to its presentable cart line, or null. */
export function resolveCartLine(variantId: string): CartCatalogLine | null {
  return lineMap.get(variantId) ?? null;
}

export function isKnownCartVariant(variantId: string): boolean {
  return lineMap.has(variantId);
}

/** Every known variant id, for localizing an entire cart at once. */
export const cartVariantIds = [...lineMap.keys()];
