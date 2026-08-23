/**
 * Every word on the page. Kept out of the components so copy can be edited,
 * A/B tested or localised without a developer.
 *
 * Claim policy: black tourmaline is described by its verifiable mineral
 * properties (hardness, pyroelectricity, piezoelectricity) and by what people
 * culturally wear it for. Nothing here asserts a health, medical or
 * therapeutic outcome — that keeps the brand out of regulatory trouble and,
 * more usefully, makes it sound like it has nothing to prove.
 */

import { daysRangeDisplay, defaultRegion } from "@/lib/shipping";

export const hero = {
  eyebrow: "Black tourmaline collection",
  headline: ["Carry your own", "current."],
  sub: "Sixteen square-cut black tourmaline stones on a seamless elastic core. Heavy enough to notice. Quiet enough to wear to anything.",
  cta: "Shop the collection",
  ctaHref: "/products/the-tourmaline-band",
  secondary: "See the stone",
  secondaryHref: "#stone",
};

export const showcase = {
  eyebrow: "The object",
  headline: "One stone. Sixteen faces.",
  body: "Each band is cut from natural schorl — the black variety of tourmaline — then barrel-polished until the faces throw a hard, wet-looking highlight. The stones sit shoulder to shoulder with no metal spacers, so what you feel on your wrist is stone and nothing else.",
  points: [
    {
      title: "No clasp to fail",
      body: "A double-corded elastic core runs the full circumference. Roll it on, forget it is there.",
    },
    {
      title: "Harder than the knife in your pocket",
      body: "Tourmaline sits at 7–7.5 on the Mohs scale. Steel sits at 5.5. It will outlast the wrist it is on.",
    },
    {
      title: "Weighted, not bulky",
      body: "40 grams across sixteen stones. Present enough to feel deliberate, low enough to slide under a cuff.",
    },
  ],
};

export const stone = {
  eyebrow: "Why tourmaline",
  headline: "The stone that makes its own charge.",
  lede: "Tourmaline is one of a short list of minerals that is both pyroelectric and piezoelectric. Warm it, or squeeze it, and it develops a measurable electrical polarity across its axis. Dutch traders in the 1700s called it aschentrekker — ash-puller — because a warmed crystal drags ash out of a pipe bowl.",
  body: "That is the whole reason this brand is called HimVolt. Not a metaphor someone in marketing reached for — an actual, documented property of the rock on your wrist.",
  paragraphs: [
    {
      title: "What it is",
      body: "Schorl: a boron silicate, iron-rich, opaque black, crystallising in long trigonal prisms. It is the most common tourmaline on earth and the hardest-wearing thing you can reasonably tie to your wrist.",
    },
    {
      title: "What people wear it for",
      body: "Black tourmaline has been carried as a grounding and protective stone across a lot of cultures for a very long time. That is a tradition, and we will tell you it is a tradition. Plenty of people wear it for exactly that reason and we think that is a good enough reason.",
    },
    {
      title: "What we will not claim",
      body: "We are not going to tell you a rock will fix your sleep, your blood pressure or your marriage. Anyone who does is selling you something else. We sell a well-made, heavy, good-looking object. That is the pitch.",
    },
  ],
};

export const features = [
  {
    icon: "stone" as const,
    label: "Grounding stone",
    body: "Natural black tourmaline, not resin, not dyed glass. Every band is cut from the same rough.",
  },
  {
    icon: "fit" as const,
    label: "One-size elastic fit",
    body: "20cm relaxed, stretches clean to a 21cm wrist. No sizing chart, no returns for fit.",
  },
  {
    icon: "ship" as const,
    label: "Free tracked shipping",
    body: "Every order, every country, no threshold. Dispatched within 1–3 business days of you clicking buy.",
  },
];

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
      "Bought the pair. Wear one, gave one to my brother on his fortieth. He has not taken it off since — and he does not wear jewellery.",
    name: "Tomás R.",
    meta: "Verified owner · Madrid",
    stars: 5,
  },
  {
    quote:
      "It is heavier than I expected in the best way. Feels like a tool, not an accessory. Sits flat under a shirt cuff.",
    name: "Ade O.",
    meta: "Verified owner · London",
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
    a: "The band measures 20cm / 7.87in relaxed and stretches comfortably onto a wrist between 16cm and 21cm (6.3–8.3in). That covers the large majority of adult men. Measure with a tape or a strip of paper around the widest part of your wrist — if you land inside that range, order with confidence. Outside it, email us before you buy and we will tell you honestly whether it will work.",
  },
  {
    q: "Is this real stone or a coated bead?",
    a: "Real natural black tourmaline — schorl. It is opaque, dense, cool to the touch on first contact, and it warms slowly. Coated glass and resin warm instantly and feel light. At 40 grams for sixteen stones, the weight in the box is the fastest way to tell.",
  },
  {
    q: "What are the benefits of a black tourmaline bracelet?",
    a: "Two separate things, and we will not blur them together. What is measurable: black tourmaline (schorl) is pyroelectric and piezoelectric — it develops a real electrical charge when warmed or squeezed, and at 7–7.5 on the Mohs scale it is genuinely harder-wearing than most everyday jewellery. What is cultural: it has been carried as a grounding and protective stone across many traditions for centuries, which is exactly why men reach for a black stone bracelet before a big meeting or a long flight — not because we are claiming it changes the outcome. We sell a well-made, heavy, good-looking object with a real mineral behind it. That is the whole pitch.",
  },
  {
    q: "How long does delivery take, and what does it cost?",
    a: `Shipping is free to every country we serve, with no minimum order. Orders are processed within 1–3 business days, then tracked delivery typically takes ${daysRangeDisplay(defaultRegion)} depending on where you are — see the full country-by-country breakdown on our About page. Your tracking number arrives by email the moment the label is scanned.`,
  },
  {
    q: "What if I do not like it?",
    a: "Send it back within 30 days for a full refund and we cover the return label. You do not need to explain yourself and you do not need the original packaging. If a band arrives damaged, send a photo instead — we will ship a replacement the same day and you keep the first one.",
  },
  {
    q: "Can I wear it in the shower or the gym?",
    a: "Yes. Tourmaline is 7–7.5 on the Mohs scale and non-porous, so water, sweat and soap do nothing to it. Rinse it under a tap and dry it with a cloth when it looks dull. Avoid dropping it onto tile — stone is hard, but hard is not the same as unbreakable.",
  },
  // {
  //   q: "What happens if the elastic goes?",
  //   a: "We will restring it free for twelve months, including postage both ways. Beyond that, email us anyway — the cord costs us almost nothing and we would rather keep the band on your wrist than sell you another one.",
  // },
];

export const finalCta = {
  eyebrow: "Lite your life",
  headline: "Put something solid on.",
  sub: "Free tracked shipping worldwide. 30 days to change your mind. Dispatched within 1–3 business days.",
  cta: "Shop the collection",
};

export const footerNav = [
  {
    title: "Shop",
    links: [
      { label: "The Tourmaline Band", href: "/products/the-tourmaline-band" },
      { label: "Blog", href: "/blog" },
      { label: "Why tourmaline", href: "#stone" },
      { label: "Sizing", href: "#faq" },
      { label: "Gift sets", href: "/products/the-tourmaline-band" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping", href: "#faq" },
      { label: "Returns & refunds", href: "#faq" },
      { label: "Restring guarantee", href: "#faq" },
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
      { label: "Our claims policy", href: "#stone" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

export const marqueeWords = [
  "Free worldwide shipping",
  "30-day returns",
  "Natural schorl tourmaline",
  "Dispatched in 1–3 business days",
  "12-month restring guarantee",
  "7–7.5 Mohs",
];
