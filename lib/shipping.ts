/**
 * Real transit-time data pulled from CJDropshipping's freight-calculation API
 * for the connected product (SPU CJSL2749017), CN → destination. Data lives
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

/** Every ISO 3166-1 alpha-2 country code — for structured data that must name destinations while shipping stays worldwide. */
export const ALL_COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );

export type TransitWindow = { minDays: number; maxDays: number };

/**
 * Delivery windows promised to customers. These must match the delivery
 * descriptions on the Shopify shipping profiles ("US only: arm trainer" and
 * "General profile"), because that is what checkout displays — change both
 * together. They deliberately override the per-country CJ figures above.
 * Arm trainer: 3–8 to the US, 7–14 to the rest of the world. All other
 * products: 5–11 worldwide.
 */
export const ARM_TRAINER_HANDLE = "hydraulic-arm-trainer";
export const ARM_TRAINER_TRANSIT: TransitWindow = { minDays: 3, maxDays: 8 };
export const ARM_TRAINER_INTL_TRANSIT: TransitWindow = { minDays: 7, maxDays: 14 };
export const STANDARD_TRANSIT: TransitWindow = { minDays: 5, maxDays: 11 };
/** For copy that isn't about one product: spans every window. */
export const OVERALL_TRANSIT: TransitWindow = {
  minDays: ARM_TRAINER_TRANSIT.minDays,
  maxDays: ARM_TRAINER_INTL_TRANSIT.maxDays,
};

/** The arm trainer is 3–8 only to a confirmed US shopper and 7–14 to everywhere else (an unknown country counts as "elsewhere", the safe promise); every other product is 5–11 worldwide. */
export const transitForHandle = (
  handle?: string | null,
  country?: string | null,
): TransitWindow => {
  if (handle !== ARM_TRAINER_HANDLE) return STANDARD_TRANSIT;
  return country?.toUpperCase() === "US" ? ARM_TRAINER_TRANSIT : ARM_TRAINER_INTL_TRANSIT;
};

/** "3–8" */
export const transitRange = (t: TransitWindow) => `${t.minDays}–${t.maxDays}`;

/** "3–8 business days" */
export const transitRangeDisplay = (t: TransitWindow) => `${transitRange(t)} business days`;

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
