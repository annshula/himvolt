/**
 * Legal / compliance pages.
 *
 * This is genuine, accurate content describing how HimVolt's storefront
 * actually behaves — the real analytics it loads, the real third parties
 * it uses, the real return window (see lib/site.ts's `promise.returns`,
 * which this must never contradict). It is not boilerplate copied from a
 * template and it is not legal advice: `requiresMerchantReview` pages
 * should get a lawyer's pass before this business relies on them in a
 * dispute. That notice renders in development and is hidden in production
 * so it is never mistaken for the real assurance.
 */

export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  requiresMerchantReview?: boolean;
  sections: { heading?: string; body: string[] }[];
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "What data HimVolt collects, who sees it, and why.",
    lastUpdated: "2026-08-30",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "HimVolt (“we”, “us”) operates himvolt.com. This page explains what information we collect when you browse, sign up, or order, and what we do with it.",
        ],
      },
      {
        heading: "Information we collect",
        body: [
          "Account and order details — name, email, shipping address, and order history — are held by Shopify, our commerce platform, as the system of record. We read this data live from your Shopify customer account rather than keeping a separate copy.",
          "If you join our newsletter, your email is stored as a Shopify customer record for that purpose.",
          "If you use the contact form or email us, we keep that message and your email address to answer you and for our own records.",
          "In your browser we set a cart/session cookie and a region/localization preference so pricing and delivery estimates match your country.",
        ],
      },
      {
        heading: "Analytics and advertising",
        body: [
          "When configured, this site loads Google Analytics (GA4), the Meta Pixel (including server-side Conversions API events), and Microsoft Clarity. Clarity can record how you interact with pages (clicks, scrolling, mouse movement) to help us fix confusing layouts — it does not knowingly record text you type into payment fields.",
          "These scripts currently load automatically when enabled on our end; this site does not yet show a cookie-consent banner letting you opt out of them individually before they load. You can block most of them using your browser's tracking-protection or ad-blocking settings.",
        ],
      },
      {
        heading: "Who we share data with",
        body: [
          "Shopify — checkout, payments, customer accounts, and order fulfillment records.",
          "CJdropshipping, our fulfillment supplier — receives the shipping details needed to pack and ship your order.",
          "Google, Meta, and Microsoft — receive analytics/advertising events as described above.",
          "We do not sell your personal information.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can review or update your account details by signing in. To request a copy of your data or its deletion, email us at the address below — since Shopify is the system of record for orders and accounts, we action these requests through Shopify on your behalf.",
        ],
      },
      {
        heading: "International shipping",
        body: [
          "We ship worldwide, so your order and shipping information is processed by Shopify and CJdropshipping in the countries where they operate, which may be outside your own country.",
        ],
      },
      {
        heading: "Children",
        body: [
          "This site is not directed at children and we do not knowingly collect information from anyone under 16.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: [
          "If this policy changes materially, we will update the date at the top of this page.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: "The terms that apply when you use himvolt.com or place an order.",
    lastUpdated: "2026-08-30",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "By using himvolt.com or placing an order, you agree to these terms and to Shopify's own terms for the checkout and payment portion of your purchase, which we use to process orders.",
        ],
      },
      {
        heading: "Products and descriptions",
        body: [
          "We describe hematite by its verifiable mineral properties — composition, hardness, density, the streak test — and separately by the grounding/protective meaning it has carried since antiquity as a cultural tradition. Nothing on this site is a medical, health, or therapeutic claim, and none of our products are intended to diagnose, treat, cure, or prevent any condition.",
          "Product photos are of the actual item where noted; colour can vary slightly by display.",
        ],
      },
      {
        heading: "Pricing and orders",
        body: [
          "Prices shown are set in our store and may change without notice; the price and details shown at checkout are the ones that apply to your order. We reserve the right to cancel an order (for example, for a pricing or stock error) and will refund you in full if we do.",
        ],
      },
      {
        heading: "Shipping and returns",
        body: [
          "See our Shipping Policy and Refund & Return Policy, which are part of these terms.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "The HimVolt name, logo, and site content are ours or used with permission. You may not reuse them without asking first.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "To the extent permitted by law, HimVolt is not liable for indirect or consequential damages arising from your use of this site or its products. Nothing here limits liability that cannot legally be limited.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of Ontario, Canada, without regard to conflict-of-law rules.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update these terms; the current version is always the one posted here.",
        ],
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund & Return Policy",
    description: "What's covered, what isn't, and how to start a claim.",
    lastUpdated: "2026-08-30",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "If your order arrives damaged, missing an item, or is the wrong item, we will send a free replacement or refund — no need to send anything back. This is a 30-day window from delivery, and it is the only return/refund path we currently offer: we do not accept change-of-mind, wrong-size, or “didn't like it” returns, so please check sizing and details before you order.",
        ],
      },
      {
        heading: "What's covered",
        body: [
          "• Item arrived damaged or defective",
          "• Item is missing from your order",
          "• You received the wrong item",
        ],
      },
      {
        heading: "What's not covered",
        body: [
          "• Change of mind, or the item is simply not what you expected",
          "• Wrong size selected at checkout (rings are true to standard US sizing and do not stretch — check your size before ordering)",
          "• Normal wear, or damage from a hard impact after delivery",
        ],
      },
      {
        heading: "How to start a claim",
        body: [
          "Email us at the address below (or use your account's order history) with your order number, a photo of the issue, and a short description, within 30 days of delivery. We will confirm your replacement or refund by email, usually within a few hours.",
        ],
      },
      {
        heading: "Refund method",
        body: [
          "Approved refunds are issued to your original payment method. Your bank may take a few additional business days to show the credit.",
        ],
      },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    description: "Cost, coverage, and how long delivery takes.",
    lastUpdated: "2026-08-30",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "Shipping is free on every order, to every country we serve, with no minimum order value.",
        ],
      },
      {
        heading: "Where we ship",
        body: [
          "Availability is shown at checkout for your address. If your country isn't offered at checkout, we don't currently ship there.",
        ],
      },
      {
        heading: "Processing and delivery time",
        body: [
          "Orders are processed and dispatched within 1–3 business days. Tracked delivery time after that varies by region — see the country-by-country breakdown on our About page, or your exact estimate at checkout.",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "You'll get a tracking number by email as soon as your order is scanned by the carrier, and can check status any time under Account → Orders.",
        ],
      },
      {
        heading: "Delays",
        body: [
          "Carrier delays are outside our control, but we can help you chase one — contact us with your order number.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    description: "Our approach to making himvolt.com usable for everyone.",
    lastUpdated: "2026-08-30",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "We want himvolt.com to be usable by as many people as possible, including people using assistive technology. We're working toward the WCAG 2.1 AA guidelines as an ongoing effort, not a one-time fix.",
        ],
      },
      {
        heading: "What we've done",
        body: [
          "Motion throughout the site respects your operating system's “reduce motion” setting — animations shorten or disable automatically rather than ignoring that preference.",
          "The FAQ uses native, keyboard-operable disclosure elements rather than custom widgets.",
          "Images carry descriptive alt text; purely decorative images are marked so screen readers skip them.",
        ],
      },
      {
        heading: "Known limitations",
        body: [
          "Some areas — particularly checkout — are hosted by Shopify, whose accessibility is outside our direct control.",
          "We haven't yet completed a full third-party accessibility audit.",
        ],
      },
      {
        heading: "Feedback",
        body: [
          "If you hit a barrier using this site, tell us — email the address below with the page and what happened, and we'll look into it.",
        ],
      },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description: "The cookies this site sets and why.",
    lastUpdated: "2026-08-30",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "Cookies are small files a site stores in your browser. Here's what himvolt.com uses them for.",
        ],
      },
      {
        heading: "Essential cookies",
        body: [
          "Used for your cart, checkout session, sign-in, and your delivery-region preference. The site won't function correctly without these.",
        ],
      },
      {
        heading: "Analytics and advertising cookies",
        body: [
          "When enabled, we use Google Analytics (GA4), the Meta Pixel, and Microsoft Clarity to understand traffic and improve the site. These set their own cookies and, for Clarity, may capture on-page interaction. They currently load automatically rather than after a consent prompt.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "Most browsers let you block or delete cookies in their privacy settings, and browser tracking-protection features can block the analytics scripts above. Blocking essential cookies may prevent checkout from working.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "If what we use changes materially, we'll update the date at the top of this page.",
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string): LegalPage | null {
  return LEGAL_PAGES.find((page) => page.slug === slug) ?? null;
}
