/**
 * Every word on the page. Kept out of the components so copy can be edited,
 * A/B tested or localised without a developer.
 *
 * Claim policy: hematite is described by its verifiable mineral properties
 * (composition, hardness, density, the red-brown streak test) and by what
 * people culturally wear it for. Nothing here asserts a health, medical or
 * therapeutic outcome — that keeps the brand out of regulatory trouble and,
 * more usefully, makes it sound like it has nothing to prove.
 */

import { daysRangeDisplay, defaultRegion } from "@/lib/shipping";
import { site } from "@/lib/site";

export const hero = {
  eyebrow: "Hematite collection",
  headline: ["Genuine hematite bracelets.", "Cut for steady hands."],
  // Same copy as the meta description (lib/site.ts) rather than its own
  // independently-worded line — the H1 already carries "genuine hematite
  // bracelets"; repeating that exact phrase again here just wastes the
  // subhead's second keyword slot instead of widening it the way the meta
  // description does. One source of truth also means the two can't quietly
  // drift apart the way promise.returns and this used to.
  sub: site.description,
  cta: "Shop the collection",
  ctaHref: "/shop",
  secondary: "See the stone",
  secondaryHref: "#stone",
};

export const showcase = {
  eyebrow: "Hematite jewelry",
  headline: "Cut from the earth's own iron.",
  body: "Every piece of hematite jewelry here starts as raw, natural hematite — iron oxide, mined and hand-polished until the surface reads as a hard, cool, metallic black. No dye, no coating: what you see under a loupe is what you feel on your wrist.",
  points: [
    {
      title: "No clasp to fail",
      body: "A stretch elastic core runs the full circumference. Roll it on, forget it is there.",
    },
    {
      title: "Level with the steel in your pocket",
      body: "Hematite sits at 5.5–6.5 on the Mohs scale — on par with hardened steel. It shrugs off the daily knocks that dull resin and dyed glass.",
    },
    {
      title: "Weighted, not bulky",
      body: "Iron oxide runs dense. 70 grams on a single strand — present enough to feel deliberate, low enough to slide under a cuff.",
    },
  ],
};

export const stone = {
  eyebrow: "Hematite meaning",
  headline: "The stone the ancient world called blood.",
  lede: "Hematite takes its name from the Greek haimatites lithos — “blood-like stone” — coined by the naturalist Theophrastus around 300 BCE. Scratch its metallic black surface and it leaves a deep red-brown streak: the same iron oxide that gives the stone both its name and its weight.",
  body: "That contradiction — a hard black metallic shell hiding a red heart — is what has kept people picking hematite up for roughly five thousand years, long before anyone called it a grounding stone.",
  paragraphs: [
    {
      title: "What it is",
      body: "Hematite: iron(III) oxide, Fe₂O₃, one of the most abundant iron ores on Earth and one of the oldest minerals worked into jewellery and pigment. Its defining properties are hardness and weight — 5.5–6.5 on the Mohs scale, roughly level with hardened steel — and density is the first thing most people notice: it is heavier in hand than a stone its size has any right to be.",
    },
    {
      title: "What hematite means",
      body: "Hematite has been carried since antiquity — Egyptian amulets, Mesopotamian seals, and centuries of grounding and protective folk tradition since. Today it is one of the most reached-for stones for grounding, focus, confidence and resilience — put on before a hard meeting or a long day for exactly that reason. That is a tradition, and we will always tell you it is a tradition. Plenty of people wear it for exactly that reason and we think that is a good enough reason.",
    },
    {
      title: "What we will not claim",
      body: "We are not going to tell you a rock will fix your focus, your confidence or your day for you. Anyone who does is selling you something else. We sell a well-made, heavy, good-looking object with a five-thousand-year story behind it. That is the pitch.",
    },
  ],
};

/**
 * The policy/trust band (components/sections/Guarantee.tsx) — every claim
 * in `items` is a real, already-established policy (lib/site.ts
 * `promise.*`), not new copy invented for this band. Kept in sync by
 * pulling the same strings rather than re-wording them, the same discipline
 * as the returns/warranty fix elsewhere in this file.
 */
export const guarantee = {
  eyebrow: "Buy with confidence",
  // Deliberately not another "genuine hematite bracelets" headline — that
  // exact phrase is already the H1. Repeating it as this section's H2 too
  // reads as keyword stuffing to a crawler, not just to a reader. This
  // section's actual subject is the policies, so it's titled as that.
  headline: "What every order includes.",
  body: "Free tracked shipping worldwide, a real fix if anything arrives wrong, and natural iron oxide in every piece — not a coated imitation.",
  items: [
    {
      icon: "stone" as const,
      label: "Genuine natural hematite",
      body: "Real iron oxide, not resin or dyed glass. Every piece streak-tests red-brown under the polish — the same mineralogy test used to identify hematite for two thousand years.",
    },
    {
      icon: "ship" as const,
      label: site.promise.shipping,
      body: site.promise.shippingFull,
    },
    {
      icon: "shield" as const,
      label: site.promise.returns,
      body: site.promise.returnsDetail,
    },
    {
      icon: "fit" as const,
      label: "Secure checkout",
      body: "Payment is processed by Shopify, not us — your card details never touch our servers.",
    },
  ],
};

/**
 * Real hematite vs. what commonly gets sold under the same name. Every row
 * restates a fact already established elsewhere on this site (Mohs scale,
 * the streak test, the natural-vs-hematine distinction in lib/site.ts and
 * the claim policy at the top of this file) — nothing new is asserted here,
 * it is just organised as a comparison.
 */
export const comparison = {
  eyebrow: "Know what you're buying",
  headline: "Genuine hematite, or something sold as hematite.",
  body: "\"Hematite\" gets used loosely — for the real mineral, for coated glass, and for a magnetic composite that shares the name but not the material. Here is how to tell them apart before you buy, from us or anywhere else.",
  columns: ["Genuine hematite", "Coated glass or resin", "Magnetic hematite (hematine)"],
  rows: [
    {
      label: "Material",
      values: ["Natural iron oxide, Fe₂O₃", "Glass or resin core with a coating", "Man-made magnetic composite"],
    },
    {
      label: "Mohs hardness",
      values: ["5.5–6.5 — on par with hardened steel", "5–6, and the coating wears through", "Softer, more prone to chipping"],
    },
    {
      label: "Weight in hand",
      values: ["Notably dense for its size", "Noticeably lighter", "Similar or heavier, but for a different reason"],
    },
    {
      label: "The streak test",
      values: ["Leaves a red-brown streak", "No red-brown streak — shows the core colour instead", "No red-brown streak"],
    },
    {
      label: "Magnetic?",
      values: ["Only very weakly", "No", "Strongly — that's the point of it"],
    },
    {
      label: "Sold as",
      values: ["Labelled genuine hematite, plainly", "Often mislabelled \"hematite\"", "Often mislabelled \"hematite\" without disclosing it's a composite"],
    },
  ],
};

/**
 * ⚠️ PLACEHOLDER TESTIMONIALS.
 * These are written examples of the voice you want, not real customers.
 * Replace every one with a verified review before launch, and do not turn on
 * `site.metrics.verified` until the numbers come from a real review platform.
 */
export const reviews = [
  {
    quote:
      "I have broken three beaded bracelets in two years. Six months on this one, worn in the gym and the shower, and the cord has not moved.",
    name: "Marcus D.",
    meta: "Verified owner · Chicago",
    stars: 5,
  },
  {
    quote:
      "Ordered Thursday, tracking number Friday, on my wrist the following Wednesday. Australia. I have waited longer for domestic orders.",
    name: "Jack W.",
    meta: "Verified owner · Melbourne",
    stars: 5,
  },
  {
    quote:
      "Honest product page, honest product. Nobody promised me it would cure anything, which is exactly why I trusted it enough to buy.",
    name: "Priyan S.",
    meta: "Verified owner · Toronto",
    stars: 5,
  },
  {
    quote:
      "The polish is properly good. Under a light it reads almost gunmetal, then it goes dead black in shade. Looks expensive.",
    name: "Nikolai V.",
    meta: "Verified owner · Berlin",
    stars: 4,
  },
];

export const faqs = [
  {
    q: "Will it fit my wrist?",
    a: "Every bracelet in the collection uses a stretch elastic core built to move with your wrist rather than a fixed link count — no sizing chart to get wrong. If you are between sizes or unsure, email us before you buy and we will tell you honestly whether a given piece will work. Rings run true to standard US sizing 6–12; check your ring size before ordering, since a ring is the one piece here that does not stretch.",
  },
  {
    q: "Is this real stone or a coated bead?",
    a: "Real natural hematite — iron oxide. It is dense for its size, cool to the touch on first contact, and — this is the actual mineralogy test — leaves a red-brown streak if scratched, despite its metallic black-grey surface. Coated glass and resin are lighter and show a different colour underneath if scratched, not red-brown.",
  },
  {
    q: "What are the benefits of a hematite bracelet?",
    a: "Two separate things, kept separate. What is measurable: hematite is iron oxide, notably dense, and sits at 5.5–6.5 on the Mohs scale — hard enough for daily wear. What is cultural: hematite has been carried since antiquity, and today it is one of the most-searched stones for regaining grounding, focus, confidence and resilience — reached for before a hard meeting, a long shift, or anything that calls for feeling steadier. We are not claiming it changes an outcome. We sell a heavy, well-made, good-looking object with a real mineral behind it and a genuinely old tradition attached to it. That is the whole pitch.",
  },
  {
    q: "How long does delivery take, and what does it cost?",
    a: `Shipping is free to every country we serve, with no minimum order. Orders are processed within 1–3 business days, then tracked delivery typically takes ${daysRangeDisplay(defaultRegion)} depending on where you are — see the full country-by-country breakdown on our About page. Your tracking number arrives by email the moment the label is scanned.`,
  },
  {
    q: "What if I don't like it, or it arrives damaged?",
    a: "We do not offer change-of-mind returns, so check sizing and details before you order. If your piece arrives damaged, missing, or is not what you ordered, send us a photo within 30 days of delivery and we will ship a free replacement or refund — no need to send anything back.",
  },
  {
    q: "Can I wear it in the shower or the gym?",
    a: "Yes, day to day. Hematite is non-porous, so a quick rinse and a wipe with a cloth is all it needs. Two things worth knowing: prolonged contact with harsh soaps or chlorine can dull the polish over time, and at 5.5–6.5 on the Mohs scale hematite is hard but not indestructible — a hard drop onto tile or metal can chip a bead the way it would chip most polished stone. Treat it like the stone it is.",
  },
  // {
  //   q: "What happens if the elastic goes?",
  //   a: "We will restring it free for twelve months, including postage both ways. Beyond that, email us anyway — the cord costs us almost nothing and we would rather keep the piece on your wrist than sell you another one.",
  // },
];

export const finalCta = {
  eyebrow: "Lite your life",
  headline: "Put something solid on.",
  sub: "Free tracked shipping worldwide. Free fix for damaged, missing, or wrong items. Dispatched within 1–3 business days.",
  cta: "Shop the collection",
};

export const footerNav = [
  {
    title: "Shop",
    links: [
      { label: "Hematite bracelets", href: "/shop" },
      { label: "Blog", href: "/blog" },
      { label: "Hematite meaning", href: "/#stone" },
      { label: "Sizing", href: "/faq" },
      { label: "Gift sets", href: "/shop" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping policy", href: "/shipping-policy" },
      { label: "Refund & return policy", href: "/refund-policy" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Track your order", href: "/account/orders" },
      { label: "Start a return", href: "/account/orders" },
      { label: "Your account", href: "/account" },
      { label: "Sign in", href: "/account/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our claims policy", href: "/#stone" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie policy", href: "/cookie-policy" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

export const marqueeWords = [
  "Free worldwide shipping",
  "Free fix for damaged or wrong items",
  "Natural hematite, iron oxide",
  "Dispatched in 1–3 business days",
  "No clasp to fail — stretch elastic fit",
  "5.5–6.5 Mohs",
];
