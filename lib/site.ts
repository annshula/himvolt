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
    "HimVolt makes genuine hematite bracelets and rings for men. Real stone, elastic and band fits, free tracked shipping worldwide, 30-day returns.",
  locale: "en_US",
  currency: "USD",

  socials: {
    instagram: "https://instagram.com/himvolt",
    tiktok: "https://tiktok.com/@himvolt",
    x: "https://x.com/himvolt",
    youtube: "https://youtube.com/@himvolt",
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
    returns: "30-day returns, no questions",
    returnsDetail: "Wear it a full month. Not yours? We pay the label.",
    warranty: "12-month workmanship guarantee",
    support: "Human replies in under 12 hours",
  },
} as const;

export type Site = typeof site;
