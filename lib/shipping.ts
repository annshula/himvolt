/**
 * Real transit-time data pulled from CJDropshipping's freight-calculation API
 * for the connected product (SPU CJSL2782519), CN → destination. Data lives
 * in data/cj-shipping.json — re-run the CJDropshipping calculate_freight tool
 * and overwrite that file when rates or transit times change.
 *
 * Courier names are kept in the JSON for internal reference only — never
 * render `_internalCourier` / `_internalPriceUsd` on the storefront. Country
 * names are fine on the About page; everywhere else, show the day range only
 * (no country/courier mentioned) so copy stays correct regardless of who's
 * looking at it.
 */
import cjShipping from "@/data/cj-shipping.json";

export type ShippingRegion = {
  code: string;
  label: string;
  group: string;
  minDays: number;
  maxDays: number;
  _internalCourier: string;
  _internalPriceUsd: number;
};

export const shipping = cjShipping as {
  generatedAt: string;
  source: string;
  product: { pid: string; productSku: string; productNameEn: string; productUrl: string };
  originCountry: string;
  defaultRegionCode: string;
  regions: ShippingRegion[];
  variantWeights: { sku: string; title: string; vid: string; weightGrams: number }[];
};

const regionByCode = new Map(shipping.regions.map((r) => [r.code, r]));

export const defaultRegion =
  regionByCode.get(shipping.defaultRegionCode) ?? shipping.regions[0];

/** Looks up the transit window for an ISO country code, falling back to the default region for anywhere we haven't priced yet. */
export function regionForCountry(isoCode?: string | null): ShippingRegion {
  if (!isoCode) return defaultRegion;
  return regionByCode.get(isoCode.toUpperCase()) ?? defaultRegion;
}

/** "4–6" */
export const daysRange = (region: ShippingRegion) => `${region.minDays}–${region.maxDays}`;

/** "4–6 business days" */
export const daysRangeDisplay = (region: ShippingRegion) => `${daysRange(region)} business days`;

/** "arrives in 4–6 days" — no country named, safe for any page. */
export const arrivesShort = (region: ShippingRegion = defaultRegion) =>
  `arrives in ${daysRange(region)} days`;

const cjVidBySku = new Map(shipping.variantWeights.map((v) => [v.sku, v.vid]));

/** Maps a HimVolt variant SKU (lib/product.ts) to CJDropshipping's own variant id — the one live freight lookups need, not the Shopify variant id. Falls back to the default ("one band") variant for an unknown SKU. */
export function cjVidForSku(sku: string): string {
  return cjVidBySku.get(sku) ?? shipping.variantWeights[0]?.vid ?? "";
}
