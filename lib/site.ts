/**
 * Single source of truth for anything a marketer might want to change without
 * touching a component. Swap the numbers here, not in the JSX.
 */

import { OVERALL_TRANSIT, transitRange } from "@/lib/shipping";

export const site = {
  name: "HimVolt",
  legalName: "HimVolt",
  tagline: "Lite your life",
  domain: "himvolt.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://himvolt.com",
  email: "support@himvolt.com",
  address: "Toronto, Ontario, Canada",
  description:
    "Men's power gear for body and mind: an adjustable hydraulic arm trainer and natural hematite bracelets and rings. Free tracked shipping worldwide.",
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
    rating: 4.9,
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
    shippingDetail: `Dispatched in 1–3 business days · ${transitRange(OVERALL_TRANSIT)} days to arrive`,
    shippingFull: `Orders are processed within 1–3 business days, then tracked delivery takes 3–8 business days for the arm trainer in the US, 7–14 business days for the arm trainer elsewhere, and 5–11 business days for everything else. The exact estimate is shown at checkout.`,
    // Accurate scope: our supplier's dispute process only backs damaged,
    // missing, and wrong-item claims — there is no general change-of-mind
    // return, so the copy must never imply one. See
    // lib/account/order-status.ts's reasonNeedsDetail() for the same line.
    returns: "Free fix for damaged, missing, or wrong items",
    returnsDetail:
      "Send a photo within 30 days of delivery and we'll ship a free replacement or refund, and that covers damage, missing items, and mis-ships, not general change-of-mind returns.",
    // Verified, not promotional: the mineral's own Mohs hardness rating
    // (see content/copy.ts stone.paragraphs). There is no workmanship or
    // time-based warranty to advertise — do not add one without a real,
    // written guarantee to back it.
    durability: "5.5–6.5 Mohs hardness, on par with hardened steel",
    support: "Human replies in under 12 hours",
  },
} as const;

export type Site = typeof site;
