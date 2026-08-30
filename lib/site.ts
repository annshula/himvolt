/**
 * Single source of truth for anything a marketer might want to change without
 * touching a component. Swap the numbers here, not in the JSX.
 */

import { daysRange, defaultRegion } from "@/lib/shipping";

export const site = {
  name: "HimVolt",
  legalName: "HimVolt",
  tagline: "Lite your life",
  domain: "himvolt.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://himvolt.com",
  email: "support@himvolt.com",
  address: "Toronto, Ontario, Canada",
  description:
    "Natural hematite stone bracelets and rings for men — real iron oxide, not resin or dye. Free tracked worldwide shipping, free fix for damaged or wrong items.",
  locale: "en_US",
  currency: "USD",

  socials: {
    instagram: "https://www.instagram.com/himvolt_official",
    tiktok: "https://tiktok.com/@himvolt",
    facebook: "https://facebook.com/himvolt",
    youtube: "https://youtube.com/@himvolt_official",
  },

  /**
   * ⚠️ PLACEHOLDER SOCIAL PROOF — replace with figures you can evidence before
   * you take this live. Fabricated ratings are an FTC problem and Google will
   * strip rich results for unverifiable review markup. Nothing in this object
   * is emitted as schema.org markup until `metrics.verified` is true.
   */
  metrics: {
    verified: false,
    rating: 4.8,
    reviewCount: 2914,
    unitsWorn: 41000,
    countries: 38,
  },

  promise: {
    shipping: "Free tracked shipping worldwide",
    // Day range only — no country named here. The real, per-country transit
    // times (live CJDropshipping data, lib/shipping.ts) live on the About
    // page; product/cart surfaces resolve the shopper's own region silently
    // via useLocalization() instead of repeating a single figure for everyone.
    shippingDetail: `Dispatched in 1–3 business days · ${daysRange(defaultRegion)} days to arrive`,
    shippingFull: `Orders are processed within 1–3 business days, then tracked delivery typically takes ${daysRange(defaultRegion)} business days depending on where you are. Full country-by-country transit times are on our About page.`,
    // Accurate scope: our supplier's dispute process only backs damaged,
    // missing, and wrong-item claims — there is no general change-of-mind
    // return, so the copy must never imply one. See
    // lib/account/order-status.ts's reasonNeedsDetail() for the same line.
    returns: "Free fix for damaged, missing, or wrong items",
    returnsDetail:
      "Send a photo within 30 days of delivery and we'll ship a free replacement or refund — that covers damage, missing items, and mis-ships, not general change-of-mind returns.",
    // Verified, not promotional: the mineral's own Mohs hardness rating
    // (see content/copy.ts stone.paragraphs). There is no workmanship or
    // time-based warranty to advertise — do not add one without a real,
    // written guarantee to back it.
    durability: "5.5–6.5 Mohs hardness — on par with hardened steel",
    support: "Human replies in under 12 hours",
  },
} as const;

export type Site = typeof site;
