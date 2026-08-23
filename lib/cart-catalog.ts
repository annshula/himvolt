/**
 * Client-safe bridge between the synced Shopify catalog (real variant ids +
 * live prices, data/product.json) and the local presentation model (friendly
 * titles + images, lib/product.ts) — across every product this store sells.
 *
 * Both sides carry the same real Shopify variant id directly, so this is a
 * straight per-id join, not an index-based one. Nothing here imports
 * server-only modules — safe for the cart provider to use on the client.
 */

import catalog from "@/data/product.json";
import { products as localProducts } from "@/lib/product";

export type CartCatalogLine = {
  variantId: string;
  name: string;
  image: string;
  unitPriceCents: number;
};

const localVariantById = new Map(
  localProducts.flatMap((p) => p.variants.map((v) => [v.id, { variant: v, product: p }])),
);

const lineMap = new Map<string, CartCatalogLine>();

for (const product of catalog.products) {
  for (const synced of product.variants) {
    const local = localVariantById.get(synced.id);
    lineMap.set(synced.id, {
      variantId: synced.id,
      name: local
        ? `${local.product.title} — ${local.variant.title}`
        : product.title,
      image: local?.variant.image ?? local?.product.gallery?.[0]?.src ?? "",
      unitPriceCents: Math.round(synced.price * 100),
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
