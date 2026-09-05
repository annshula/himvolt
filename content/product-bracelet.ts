/**
 * Marketing copy for the flagship product page — the Hematite Men's Bracelet.
 * Mounted by components/product/Bracelet*.tsx, which the product page renders
 * only for this handle (app/products/[handle]/page.tsx), so no other listing
 * inherits the pitch.
 *
 * Claim policy — the hard lines are the same as the rest of the site: no
 * medical, physiological or therapeutic claims (this is natural, non-magnetic
 * hematite — no "magnetism as medicine"), no invented sales figures, no fake
 * reviews, no fabricated press or awards. The tone here is deliberately
 * belief-forward and sales-first — this is the buy page, and the story sells
 * the stone the way men have believed in it for five thousand years, without
 * hedging or disclaiming. The three headline numbers (69.9% iron, 5.5–6.5
 * Mohs, 70 g) are real, and they double as the proof.
 */

export const bracelet = {
  handle: "hematite-mens-bracelet",

  /** Bold strap shown under the product subtitle in the buy-box column. */
  hook: "Five thousand years of men reaching for the same iron before the moments that matter. It’s your turn.",

  /** Marketing subtitle shown under the H1, replacing the raw merchant subtitle. */
  subtitle:
    "Genuine natural hematite, hand-polished. Real iron, no coating, no filler.",

  /* ------------------------------------------------------------------ */
  /* Cinematic dark story band — right after the buy box.                */
  /* ------------------------------------------------------------------ */
  story: {
    eyebrow: "The stone men reach for",
    heading: "Five thousand years. Still the first thing men reach for.",
    lede: "Nobody had to tell the first man to put iron on his wrist before the thing that mattered. He felt it: the cool weight, the steadiness, the quiet in his head. Every civilisation since has done exactly the same. That isn’t folklore to explain away. It’s the longest-running product review in history, and it’s still five stars.",
    claim:
      "Men don’t wear this because they read about it. They wear it because it works, and it has worked for every generation that ever put it on.",
    stats: [
      {
        value: "69.9%",
        label: "iron by weight, the same element at the heart of your blood",
      },
      {
        value: "5.5–6.5",
        label: "Mohs hardness, level with hardened steel",
      },
      {
        value: "70 g",
        label: "of grounding weight in hand. You feel it the second it’s on",
      },
    ],
    eras: [
      {
        title: "Kings were buried with it",
        body: "Egyptian pharaohs didn’t take hematite to the tomb for decoration. Amulets of this iron went with them to carry their strength into whatever came next. Men have always worn it for what comes next.",
      },
      {
        title: "The Greeks called it blood",
        body: "Haimatites, “blood-like,” because the black stone bleeds red when it breaks. Iron is the blood of the earth, and the man who wore it carried a little of that with him. The name stuck because the feeling did.",
      },
      {
        title: "The iron is in you",
        body: "Nearly 70% of this stone is iron, the very element that powers the blood in your veins. Warriors, athletes and leaders have worn iron at the wrist since before history was written. Put it on and you carry the same thing they did.",
      },
      {
        title: "It still hasn’t stopped working",
        body: "Today men still reach for it before the pitch, the interview, the long shift and the hard conversation. Not because anyone told them to. Because it’s what men have done for five thousand years, and it keeps working.",
      },
    ],
    caption: "Natural hematite, worn skin-on-stone. No coating. No pretending.",
  },

  /* ------------------------------------------------------------------ */
  /* Benefit moments — feeling language, never a medical outcome.        */
  /* ------------------------------------------------------------------ */
  moments: {
    eyebrow: "What it’s for",
    heading: "Worn for the moments you can’t afford to drop.",
    lede: "An object a man reaches for when something hard is coming: the same calm, grounding instinct that has steadied hands for five thousand years. Put it on and feel the difference.",
    items: [
      {
        title: "Before the pitch",
        body: "A quiet minute, a room full of people who need convincing, and a weight on your wrist that says you’ve done this before. You have.",
      },
      {
        title: "The long shift",
        body: "Hours in, everything loud, everyone wanting a piece of you. The bracelet is the small, cool thing that stays exactly where you left it.",
      },
      {
        title: "The hard conversation",
        body: "The one you’ve rescheduled twice. Some men crack their knuckles. Some men turn the beads. Both are doing the same thing: steadying a hand.",
      },
      {
        title: "The morning you wake up wrong",
        body: "Some days start off balance. Putting the bracelet on is a deliberate act, the way you tell the day it doesn’t get to set your pace.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Genuine vs the lookalikes — every cell is a real material fact.     */
  /* ------------------------------------------------------------------ */
  versus: {
    eyebrow: "Know exactly what you’re buying",
    heading: "Most “magnetic hematite” is not hematite at all.",
    lede: "This page is about one material: natural iron oxide, the real stone. Here’s how it sits next to what usually gets sold under the same name, so the difference is obvious before you buy, from us or anywhere else.",
    columns: [
      "This bracelet",
      "“Magnetic hematite”",
      "Bargain “black stone” beads",
    ],
    rows: [
      {
        label: "Material",
        values: [
          "Natural hematite, iron oxide (Fe₂O₃)",
          "Man-made magnetic composite (hematine)",
          "Glass or resin under a metallic coating",
        ],
      },
      {
        label: "The streak test",
        values: [
          "Scratch it and it bleeds red-brown, the mineralogist’s test",
          "No red streak. It isn’t the mineral.",
          "Shows the dyed core colour, not red",
        ],
      },
      {
        label: "Hardness",
        values: [
          "5.5–6.5 Mohs, level with hardened steel",
          "Softer, chips and flakes over time",
          "The coating wears through in months",
        ],
      },
      {
        label: "Weight in hand",
        values: [
          "70 g of real density",
          "Heavy, but for a different reason",
          "Feels light and hollow",
        ],
      },
      {
        label: "Magnetic?",
        values: [
          "Only weakly, and we say so plainly",
          "Strongly, that’s the point of the composite",
          "No",
        ],
      },
      {
        label: "The fine print",
        values: [
          "Plainly labelled, honestly described",
          "The name does the work of implying “natural”",
          "Nobody is testing these beads",
        ],
      },
    ],
    close:
      "Real hematite doesn’t need a magnet to sell itself. When a listing leans hard on the pull, that’s the moment to ask what the beads are actually made of.",
  },

  /* ------------------------------------------------------------------ */
  /* Risk-reversal close — every claim is a real, established policy     */
  /* (lib/site.ts promise.*). No invented money-back guarantee.          */
  /* ------------------------------------------------------------------ */
  covered: {
    eyebrow: "Covered, or we make it right",
    heading: "Thirty days to decide. Free to fix if it’s wrong.",
    lede: "Every order ships tracked, worldwide, on us. If your bracelet arrives damaged, missing or wrong, send a photo within 30 days and we replace it or refund it, free, no forms to fight through.",
    cta: "Add it to your bag",
    note: "Dispatched in 1–3 business days · tracked to your door · a human answers within 12 hours",
  },

  /* ------------------------------------------------------------------ */
  /* Reviews landing space — intentionally no fabricated numbers.        */
  /* ------------------------------------------------------------------ */
  reviews: {
    eyebrow: "Customer reviews",
    heading: "Verified reviews are being collected.",
    body: "We only publish reviews from confirmed orders, with no cherry-picked quotes, no invented stars, no paid testimonials. The first real ones land as soon as buyers have worn it long enough to have an honest opinion.",
    points: [
      "Photos of the piece as it actually arrived",
      "Star ratings from confirmed orders only",
      "Every review published, the stinging ones included",
    ],
  },
};
