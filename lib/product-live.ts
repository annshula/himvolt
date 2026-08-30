import "server-only";

import { CATALOG_PATH, readJsonFile } from "@/lib/catalog/storage";
import { mapSyncedProducts, products, type Product } from "@/lib/product";
import type { SyncedCatalogRecord } from "@/lib/shopify/sync-product";

/**
 * Live-synced catalog reads — split out from lib/product.ts specifically so
 * this file can be `"server-only"`. lib/product.ts is reachable from a
 * client component (CartProvider.tsx → lib/cart-catalog.ts → lib/product.ts,
 * for synchronous cart-line validation in the browser), so anything in
 * lib/product.ts itself must stay bundle-safe for the client — adding the
 * Vercel Blob / node:fs-backed storage import there directly broke the
 * client build outright ("You're importing a component that needs
 * 'server-only'"). Keeping the live read here instead means lib/product.ts
 * never touches lib/catalog/storage.ts.
 *
 * Reads through lib/catalog/storage.ts, which checks Vercel Blob (where
 * POST /api/admin/sync-product and the Shopify product webhooks actually
 * persist a sync in production, since the deployed function's own
 * filesystem is read-only there) and falls back to lib/product.ts's
 * build-time `products` snapshot if no sync has run yet in this
 * environment. Use this, not the plain `products` export, anywhere a
 * shopper-facing surface should reflect a sync that happened after the last
 * deploy without needing a redeploy — currently: the sitemap and the
 * llms.txt family. Deliberately NOT wired into the product detail page, the
 * shop listing, or the homepage showcase yet: those all resolve pricing
 * through lib/catalog.ts, which has its own separate, much more pervasive
 * static import (variant ids, market prices, cart/checkout matching) that
 * needs its own careful conversion before pricing can safely go live too —
 * threading freshness through just the display layer here first, without
 * touching checkout-adjacent code, on purpose.
 */
export async function getLiveProducts(): Promise<Product[]> {
  const record = await readJsonFile<SyncedCatalogRecord>(CATALOG_PATH);
  return record ? mapSyncedProducts(record.products) : products;
}

export async function getLiveProductByHandle(
  handle: string,
): Promise<Product | undefined> {
  const live = await getLiveProducts();
  return live.find((p) => p.handle === handle);
}
