/**
 * Product catalog — a typed view over data/product.json, and nothing else.
 * Every field here (title, subtitle, material, descriptionHtml, gallery,
 * specs, features, variant prices and images) is read from that one file at
 * module load; there is no hand-maintained data array in this file to drift
 * out of sync with it.
 *
 * Everything in data/product.json is Shopify-sourced and safe for `npm run
 * shopify:sync` to overwrite: title and descriptionHtml are the product's
 * real Shopify fields; subtitle, material, specs and features come from
 * Shopify Admin metafields (custom.subtitle, custom.material, custom.specs,
 * custom.feature_highlights — the latter two are lists of Metaobjects, so a
 * merchant can add/reorder/remove rows from Shopify Admin, not just edit
 * their text). Editing any of it happens in Shopify, then `npm run
 * shopify:sync` pulls it in — never here. The one exception is a variant's
 * display `title`/`subtitle` (a cleaned-up version of Shopify's raw
 * option-value title, kept separately as `shopifyTitle`), since Shopify has
 * no per-variant equivalent of a metafield-backed display name to source it
 * from — see lib/shopify/sync-product.ts for the full account.
 *
 * Five real, live products on the connected Shopify store (vendor HIMVOLT) —
 * three hematite bracelets and two hematite rings, sourced from
 * CJDropshipping. Claim policy: hematite's mineral properties (composition,
 * hardness, density, the streak test) are stated as fact; everything else —
 * grounding, tradition — is framed as culture, never a health or medical
 * outcome. One extra honesty note this product line needs: natural hematite
 * is only weakly magnetic. Where a listing is sold as "magnetic hematite"
 * (the curved ring's magnetic variants), that's standard industry practice
 * for a man-made magnetic hematite (often called "hematine"), not a claim
 * that the natural stone itself is strongly magnetic — said plainly on that
 * product's page rather than left for the customer to assume.
 */

import catalog from "@/data/product.json";
import type { SyncedCatalogRecord } from "@/lib/shopify/sync-product";

export type Money = { amount: number; currencyCode: string };

export type Variant = {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  quantity: number;
  price: Money;
  compareAtPrice?: Money;
  /** Bundle framing distinct from a plain sale price — "Buy 1 Get 1", etc. Unused by the current catalog. */
  badge?: string;
  offer?: string;
  image: string;
  availableForSale: boolean;
  /** True when real Shopify inventory for this variant is low — the count itself is never exposed here (it flows through client components, and the number is treated as confidential); this is a derived boolean computed once, server-side, from lib/catalog.ts's SyncedVariant.stockQuantity. */
  lowStock: boolean;
  weightGrams: number;
};

export type CatalogImage = { src: string; alt: string; width: number; height: number };
export type CatalogVideo = { poster: string; sources: { src: string; type: string }[] };

export type Product = {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  descriptionHtml: string;
  material: string;
  gallery: CatalogImage[];
  /** From the custom.specs Shopify metafield (a list of Product spec metaobjects) — `description`/`image`/`video` are optional richer content a merchant can add per row from Shopify Admin; `image` falls back to a gallery photo where it's rendered (ProductShowcase) if a row has none yet, and `video` (when present) takes over from `image` there entirely. */
  specs: { label: string; value: string; description?: string; image?: CatalogImage | null; video?: CatalogVideo | null }[];
  /** From the custom.feature_highlights Shopify metafield — merchant-editable in Shopify Admin, no code change needed. `icon` is validated against the known set where it's rendered (components/product/ProductShowcase.tsx), not here. */
  features: { icon: string; label: string; body: string; image?: CatalogImage | null; video?: CatalogVideo | null }[];
  variants: Variant[];
};

const usd = (amount: number): Money => ({ amount, currencyCode: "USD" });

/** At or below this real Shopify count, a variant is "low stock" — see Variant.lowStock. */
const LOW_STOCK_THRESHOLD = 10;

/**
 * Exported so lib/product-live.ts (server-only) can reuse this exact mapping
 * for freshly Blob-read data — kept in this file, not there, so there is
 * only ever one place that turns a synced record into a `Product`.
 */
export function mapSyncedProducts(
  syncedProducts: SyncedCatalogRecord["products"],
): Product[] {
  return syncedProducts.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    subtitle: p.subtitle,
    descriptionHtml: p.descriptionHtml,
    material: p.material,
    gallery: p.images,
    specs: p.specs,
    features: p.features ?? [],
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      subtitle: v.subtitle,
      quantity: v.quantity,
      price: usd(v.price),
      compareAtPrice: v.compareAtPrice != null ? usd(v.compareAtPrice) : undefined,
      // A variant with no image of its own (Shopify allows this) falls back
      // to the product's main photo rather than rendering blank.
      image: v.image ?? p.images[0]?.src ?? "",
      availableForSale: v.availableForSale,
      lowStock:
        typeof v.stockQuantity === "number" &&
        v.stockQuantity > 0 &&
        v.stockQuantity <= LOW_STOCK_THRESHOLD,
      weightGrams: v.weightGrams,
    })),
  }));
}

/**
 * Build-time snapshot — whatever was committed to data/product.json as of
 * the last deploy. Used by anything that must stay synchronous: client-side
 * cart validation (lib/cart-catalog.ts, which a browser can call without a
 * server round-trip), and any type-only import. Never edit this file by
 * hand; `npm run shopify:sync` regenerates it from Shopify.
 */
export const products: Product[] = mapSyncedProducts(catalog.products);

/** The main/hero product — every generic "shop now" CTA hands off here. */
export const product: Product = products[0];

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

export const formatMoney = (m: Money) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currencyCode,
    minimumFractionDigits: m.amount % 1 === 0 ? 0 : 2,
  }).format(m.amount);

export const unitPrice = (v: Variant) => usd(v.price.amount / v.quantity);

export const savingsPercent = (v: Variant) =>
  v.compareAtPrice
    ? Math.round((1 - v.price.amount / v.compareAtPrice.amount) * 100)
    : 0;
