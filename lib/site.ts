/**
 * Single source of truth for anything a marketer might want to change without
 * touching a component. Swap the numbers here, not in the JSX.
 */

export const site = {
  name: "HimVolt",
  legalName: "HimVolt",
  tagline: "Lite your life",
  domain: "himvolt.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://himvolt.com",
  email: "support@himvolt.com",
  description:
    "HimVolt makes one thing properly: a square-cut black tourmaline bracelet for men. Solid stone, elastic fit, free tracked shipping worldwide, 30-day returns.",
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
    shippingDetail: "Dispatched in 1–3 business days · 5–10 days to the US & UK",
    // Full tiered breakdown — used on the FAQ and anywhere there is room for
    // the honest, country-by-country version rather than the short chip copy
    // above. Processing + transit, not a single optimistic number.
    shippingFull:
      "Orders are processed within 1–3 business days. Tracked delivery then runs 5–10 business days to the US and UK, 6–12 business days to Canada, Australia and the EU, and 7–15 business days everywhere else.",
    returns: "30-day returns, no questions",
    returnsDetail: "Wear it a full month. Not yours? We pay the label.",
    warranty: "12-month restring guarantee",
    support: "Human replies in under 12 hours",
  },
} as const;

export type Site = typeof site;
