/**
 * Product catalog — a typed view over data/product.json, and nothing else.
 * Every field here (title, gallery, specs, descriptionHtml, variant prices
 * and images) is read from that one file at module load; there is no
 * hand-maintained data array in this file to drift out of sync with it.
 *
 * data/product.json mixes two kinds of field per product/variant:
 *  - Shopify-sourced: id, handle, title (raw), price, compareAtPrice,
 *    availableForSale, images, variant image, pricesByMarket — safe for
 *    `npm run shopify:sync` to overwrite on every run.
 *  - Curated: subtitle, material, descriptionHtml, specs, and the variant's
 *    display `title`/`subtitle` (a cleaned-up version of Shopify's raw
 *    option-value title, kept separately as `shopifyTitle`) — hand-authored
 *    content sync must never touch, since Shopify has no field for "Mohs
 *    hardness" or an honest claims-policy description.
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
  weightGrams: number;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  descriptionHtml: string;
  material: string;
  gallery: { src: string; alt: string; width: number; height: number }[];
  specs: { label: string; value: string }[];
  variants: Variant[];
};

const usd = (amount: number): Money => ({ amount, currencyCode: "USD" });

export const products: Product[] = catalog.products.map((p) => ({
  id: p.id,
  handle: p.handle,
  title: p.title,
  subtitle: p.subtitle,
  descriptionHtml: p.descriptionHtml,
  material: p.material,
  gallery: p.images,
  specs: p.specs,
  variants: p.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    title: v.title,
    subtitle: v.subtitle,
    quantity: v.quantity,
    price: usd(v.price),
    compareAtPrice: v.compareAtPrice != null ? usd(v.compareAtPrice) : undefined,
    image: v.image,
    availableForSale: v.availableForSale,
    weightGrams: v.weightGrams,
  })),
}));

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
