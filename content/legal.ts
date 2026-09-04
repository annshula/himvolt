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
    lastUpdated: "2026-09-04",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "HimVolt (“we”, “us”, “our”) operates himvolt.com. This policy explains what information we collect when you browse, create an account, subscribe, or place an order, why we collect it, who we share it with, and the choices you have. By using this site, you agree to the practices described here.",
        ],
      },
      {
        heading: "Information we collect",
        body: [
          "Account and order details — name, email, shipping address, and order history — are held by Shopify, our commerce and payments platform, as the system of record. We read this data live from your Shopify customer account rather than keeping a separate copy of it ourselves.",
          "If you subscribe to our newsletter, your email is stored as a Shopify customer record for that purpose and used only to send you the emails you signed up for.",
          "If you use the contact form or email us directly, we keep that message and your email address to respond to you and for our own support records.",
          "In your browser we set a cart/session cookie and a region/localization preference so your pricing, currency, and delivery estimate match your country. See our Cookie Policy for the full list.",
          "We never see or store your payment card details. Checkout is hosted entirely by Shopify, which is independently certified to PCI-DSS Level 1 — your card number never reaches our servers.",
        ],
      },
      {
        heading: "Analytics and advertising",
        body: [
          "When configured, this site loads Google Analytics (GA4), the Meta Pixel (including server-side Conversions API events), and Microsoft Clarity. Clarity can record how you interact with pages — clicks, scrolling, mouse movement — to help us find and fix confusing layouts. It does not knowingly record text typed into payment fields, which are hosted by Shopify and outside the page Clarity observes.",
          "These scripts currently load automatically when enabled on our end; this site does not yet show a cookie-consent banner letting you opt out of them individually before they load. You can block most of them using your browser's tracking-protection, \"Do Not Track,\" or ad-blocking settings — we honor blocks made this way, though we do not currently detect or respond to a Do Not Track browser signal on our own server.",
        ],
      },
      {
        heading: "Who we share data with",
        body: [
          "• Shopify — checkout, payments, customer accounts, and order fulfillment records.",
          "• Our manufacturer — receives the name, address, and order details needed to pack and ship your order, and nothing more.",
          "• Google, Meta, and Microsoft — receive analytics and advertising events as described above, under their own privacy policies.",
          "• Law enforcement or regulators, only where we're required to by law.",
          "We do not sell or rent your personal information to anyone, and we never share it for a third party's own marketing purposes.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Order and account records are retained for as long as your Shopify customer account exists, or as needed to meet our tax and accounting obligations, whichever is longer. Contact-form messages are kept only as long as needed to resolve your inquiry, unless we're legally required to keep them longer.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "Wherever you're located, you can review or update your account details by signing in at any time. You can also ask us to: confirm what personal information we hold about you, correct it, delete it, or export a copy of it. If you're in a jurisdiction with a formal right to this (for example the EU/UK under the GDPR, or a US state with its own privacy law), we'll honor that right regardless of where you live.",
          "To make any of these requests, email us at the address below with the email address on your order or account. Because Shopify is the system of record for orders and accounts, we action these requests through Shopify on your behalf, typically within 30 days.",
        ],
      },
      {
        heading: "International data transfers",
        body: [
          "We ship worldwide, so your order and shipping information is processed by Shopify and our manufacturer in the countries where they operate, which may be outside your own country and may not offer the same legal data protections. All providers we use maintain their own safeguards for handling data across borders.",
        ],
      },
      {
        heading: "Children's privacy",
        body: [
          "This site is not directed at children, and we do not knowingly collect personal information from anyone under 16. If you believe a child has provided us with personal information, contact us and we'll delete it.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: [
          "We may update this policy as our practices change. Material changes will be reflected by updating the date at the top of this page; we encourage you to check back periodically.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: "The terms that apply when you use himvolt.com or place an order.",
    lastUpdated: "2026-09-04",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "These Terms of Service govern your use of himvolt.com and any order you place with us. By browsing this site or placing an order, you agree to these terms and to Shopify's own terms for the checkout and payment portion of your purchase, which we use to process orders. If you don't agree to these terms, please don't use this site.",
        ],
      },
      {
        heading: "Eligibility and accounts",
        body: [
          "You must be at least 18, or the age of majority in your jurisdiction, to place an order. If you create an account, you're responsible for keeping your login details confidential and for anything that happens under your account.",
        ],
      },
      {
        heading: "Products and descriptions",
        body: [
          "We describe hematite by its verifiable mineral properties — composition, hardness, density, the streak test — and separately by the grounding/protective meaning it has carried since antiquity as a cultural tradition. Nothing on this site is a medical, health, or therapeutic claim, and none of our products are intended to diagnose, treat, cure, or prevent any condition.",
          "Product photos are of the actual item where noted; colour can vary slightly by display, and natural stone means no two pieces are perfectly identical.",
          "We try to keep stock and pricing accurate, but errors happen. If an item you ordered is mispriced or out of stock, we'll contact you before charging or shipping anything.",
        ],
      },
      {
        heading: "Pricing and orders",
        body: [
          "Prices shown are set in our store and may change without notice; the price and details shown at checkout are the ones that apply to your order. Placing an order is an offer to buy, which we're free to accept or decline — for example, for a pricing or stock error, or suspected fraud. If we cancel an order after payment, we'll refund you in full.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "You agree not to use this site for any unlawful purpose, to attempt to disrupt or gain unauthorized access to it, to scrape or resell its content without permission, or to place fraudulent orders.",
        ],
      },
      {
        heading: "Shipping and returns",
        body: [
          "Our Shipping Policy and Refund & Return Policy describe how we ship orders and handle claims, and are part of these terms.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "The HimVolt name, logo, product photography, and site content are ours or used with permission. You may not copy, reuse, or redistribute them without asking first.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "This site and its products are provided \"as is.\" To the extent permitted by law, HimVolt is not liable for indirect, incidental, or consequential damages arising from your use of this site or its products, and our total liability for any claim is limited to the amount you paid for the order in question. Nothing here limits liability that cannot legally be limited, including for our own gross negligence or willful misconduct.",
        ],
      },
      {
        heading: "Force majeure",
        body: [
          "We're not responsible for delays or failures caused by events outside our reasonable control, including carrier disruptions, customs delays, extreme weather, or other circumstances beyond our control.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of Ontario, Canada, without regard to conflict-of-law rules. Any dispute will be handled in the courts of Ontario, Canada, unless local consumer-protection law requires otherwise.",
        ],
      },
      {
        heading: "Severability",
        body: [
          "If any part of these terms is found unenforceable, the rest remains in full effect.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update these terms as our business or the law changes; the current version, dated above, is always the one posted here and applies going forward.",
        ],
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund & Return Policy",
    description: "What's covered, what isn't, and how to start a claim.",
    lastUpdated: "2026-09-04",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "If your order arrives damaged, missing an item, or is the wrong item, we will send a free replacement or a full refund — no need to send anything back. This applies within 30 days of delivery, and it is the only return/refund path we currently offer: we do not accept change-of-mind, wrong-size, or “didn't like it” returns, so please check sizing and details carefully before you order.",
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
          "• Normal wear and tear, or damage from a hard impact after delivery",
          "• Claims made more than 30 days after your delivery date",
        ],
      },
      {
        heading: "How to start a claim",
        body: [
          "Email us at the address below (or use your account's order history) with your order number, a photo of the issue, and a short description, within 30 days of delivery. We will review it and confirm your replacement or refund by email — most claims are approved within a few hours, and we'll tell you directly if we need anything else to process yours.",
        ],
      },
      {
        heading: "Refund method",
        body: [
          "Approved refunds are issued to your original payment method within a few business days of approval. Your bank or card issuer may take a few additional business days beyond that to show the credit on your statement.",
        ],
      },
      {
        heading: "Order cancellations",
        body: [
          "Orders are sent to fulfillment quickly, so if you need to cancel or change one, email us as soon as possible — we can only make changes before it's dispatched.",
        ],
      },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    description: "Cost, coverage, and how long delivery takes.",
    lastUpdated: "2026-09-04",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "Shipping is free on every order, to every country we serve, with no minimum order value and no hidden fees at our end.",
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
        heading: "Customs, duties, and taxes",
        body: [
          "For orders shipped outside the country our warehouse ships from, your local customs authority may charge import duties, taxes, or handling fees on arrival. These are set by your country, not by us, and aren't included in your order total — they're the recipient's responsibility to pay if charged. We can't predict or waive them.",
        ],
      },
      {
        heading: "Address accuracy",
        body: [
          "Please double-check your shipping address at checkout. We ship to the address exactly as entered, and can't reroute a package once it's handed to the carrier — if it comes back to us as undeliverable due to an incorrect address, we'll contact you to arrange reshipment, which may involve an additional shipping charge.",
        ],
      },
      {
        heading: "Delays and lost packages",
        body: [
          "Carrier delays are outside our control, but we can help you chase one — contact us with your order number. If tracking shows your package as delivered but you can't find it, check with neighbors and your local carrier facility first, then contact us within 7 days so we can open a trace with the carrier.",
        ],
      },
    ],
  },
  {
    slug: "claims-policy",
    title: "Claims Policy",
    description: "What we say about hematite, and what we deliberately don't.",
    lastUpdated: "2026-09-04",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "This page explains exactly what HimVolt claims about hematite, and where we draw the line. We describe our stone two ways — by verifiable mineral fact, and by cultural tradition — and we never blur the two into a health claim.",
        ],
      },
      {
        heading: "The mineral fact",
        body: [
          "Every piece is genuine hematite: iron(III) oxide, Fe₂O₃, one of the most abundant iron ores on Earth. It rates 5.5–6.5 on the Mohs hardness scale — roughly on par with hardened steel — and is notably dense for its size, which is the first thing most people notice holding it. Scratched against unglazed porcelain, it leaves a red-brown streak: the same mineralogy test used to identify hematite for roughly two thousand years, and the simplest way to tell it apart from coated glass, resin, or magnetic \"hematine\" composites sold under the same name.",
          "These properties are testable and we stand behind them. If a piece you receive doesn't streak red-brown, contact us — see our Refund & Return Policy.",
        ],
      },
      {
        heading: "The cultural tradition",
        body: [
          "Hematite has been carried since antiquity — in Egyptian amulets, Mesopotamian seals, and centuries of grounding and protective folk tradition since, a lineage stretching back roughly five thousand years. Today it remains one of the most reached-for stones for grounding, focus, confidence, and resilience, often worn before a demanding day for exactly that reason.",
          "We describe that history and that tradition because it's true and it's why people wear the stone. We do not present it as anything more than what it is: a tradition, not a mechanism.",
        ],
      },
      {
        heading: "What we do not claim",
        body: [
          "We do not say hematite treats, cures, prevents, or diagnoses any medical or psychological condition. We do not say it has a measurable effect on mood, energy, focus, or health. Nothing we sell is a medical device, a supplement, or a therapeutic product, and nothing in our marketing should be read as such.",
          "If you're buying for a specific health outcome, this isn't the product for that, and we'd rather tell you now than after your order.",
        ],
      },
      {
        heading: "Marketing and reviews",
        body: [
          "Any testimonial or review we publish reflects one customer's personal experience or opinion, not a guaranteed or typical result, and is never edited to imply a health outcome we don't otherwise claim.",
        ],
      },
      {
        heading: "Questions about a specific claim",
        body: [
          "If something on this site reads to you like a health claim, we consider that a bug, not a feature — email us at the address below with the page and the exact wording, and we'll review and correct it.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    description: "Our approach to making himvolt.com usable for everyone.",
    lastUpdated: "2026-09-04",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "We want himvolt.com to be usable by as many people as possible, including people using assistive technology such as screen readers, screen magnifiers, or keyboard-only navigation. We're working toward the WCAG 2.1 Level AA guidelines as an ongoing effort, not a one-time fix.",
        ],
      },
      {
        heading: "What we've done",
        body: [
          "Motion throughout the site respects your operating system's “reduce motion” setting — animations shorten or disable automatically rather than ignoring that preference.",
          "The FAQ uses native, keyboard-operable disclosure elements rather than custom widgets, and the whole site is navigable by keyboard.",
          "Images carry descriptive alt text; purely decorative images are marked so screen readers skip them.",
          "Text and interactive elements are built to maintain sufficient color contrast against their backgrounds.",
        ],
      },
      {
        heading: "Known limitations",
        body: [
          "Some areas — particularly checkout — are hosted by Shopify, whose accessibility is outside our direct control, though Shopify maintains its own accessibility commitments.",
          "We haven't yet completed a full third-party accessibility audit, so some issues may exist that we're not aware of.",
        ],
      },
      {
        heading: "Feedback",
        body: [
          "If you hit a barrier using this site, tell us — email the address below with the page and what happened, and we'll look into it and get back to you.",
        ],
      },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description: "The cookies this site sets and why.",
    lastUpdated: "2026-09-04",
    requiresMerchantReview: true,
    sections: [
      {
        body: [
          "Cookies are small text files a site stores in your browser to remember information between visits or page loads. This page lists what himvolt.com uses them for and the choices you have.",
        ],
      },
      {
        heading: "Essential cookies",
        body: [
          "Used for your shopping cart, checkout session, sign-in, and your delivery-region and currency preference. These are set by us and by Shopify, our checkout provider. The site won't function correctly without these, and they can't be switched off through a settings panel — you can only block them at the browser level, which will also break checkout.",
        ],
      },
      {
        heading: "Analytics and advertising cookies",
        body: [
          "When enabled, we use Google Analytics (GA4), the Meta Pixel, and Microsoft Clarity to understand traffic and improve the site. These set their own cookies and, for Clarity, may capture on-page interaction such as clicks and scrolling. They currently load automatically rather than after a consent prompt.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "Most browsers let you block or delete cookies in their privacy settings, and browser tracking-protection or ad-blocking features can block the analytics scripts above without affecting your ability to shop. Blocking essential cookies, on the other hand, may prevent checkout and sign-in from working correctly.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "If the cookies we use change materially, we'll update the date at the top of this page.",
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string): LegalPage | null {
  return LEGAL_PAGES.find((page) => page.slug === slug) ?? null;
}
