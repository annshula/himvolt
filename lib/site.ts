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
  email: "care@himvolt.com",
  description:
    "HimVolt makes one thing properly: a square-cut black tourmaline bracelet for men. Solid stone, elastic fit, free tracked shipping worldwide, 60-day returns.",
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
    shippingDetail: "Dispatched in 24h · 5–9 business days to US, UK & EU",
    returns: "60-day returns, no questions",
    returnsDetail: "Wear it a full month. Not yours? We pay the label.",
    warranty: "12-month restring guarantee",
    support: "Human replies in under 12 hours",
  },
} as const;

export type Site = typeof site;
