import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Cache tag vocabulary shared by pages and webhook/API revalidation —
 * ported from the reference2 build (lib/catalog/tags.ts). Scoped to what
 * this site actually renders from synced data: the product catalog
 * (data/product.json). No collections/blog/shop (those are not Shopify-driven
 * here).
 *
 * Next 15 — `revalidateTag(tag)` takes no cache-life profile argument
 * (that's a Next 16 addition), so the purge helpers stay one-argument.
 */

export const CACHE_TAGS = {
  catalog: "catalog",
  cart: "cart",
  product: (handle: string) => `product:${handle}`,
} as const;

/** Purge every cache entry tagged `tag`. */
export function purgeTag(tag: string): void {
  revalidateTag(tag);
}

export function purgePath(path: string, type?: "layout" | "page"): void {
  revalidatePath(path, type);
}

/** A product changed — drop its own tag, the whole catalog tag, and its ISR page. */
export function revalidateProduct(handle: string): void {
  purgeTag(CACHE_TAGS.product(handle));
  purgeTag(CACHE_TAGS.catalog);
  purgePath(`/products/${handle}`);
}
