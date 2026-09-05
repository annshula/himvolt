/**
 * Shared conversion content for every product page — the same playbook as
 * the flagship Hematite Men's Bracelet, rolled out to all five pieces.
 *
 * Structure:
 *  - `quality`  — the "put to the test" QC section (mounted on every PDP,
 *    targeted from the header "Quality" link).
 *  - `sources`  — outbound reference links for the myth/history story.
 *    Real, reputable pages → good for credibility AND for the backlink
 *    profile (they're the only fabricated-looking thing we never fake).
 *  - `pitches`  — per-handle hook/story/moments so every product gets its
 *    own hero copy instead of a copy-pasted bracelet page.
 *
 * Register (same as the rest of the site): hard claims are real mineral
 * facts or in-house QC framing; the story is history/tradition/belief sold
 * hard; no medical claims, no invented sales figures, no fake reviews, no
 * fabricated third-party certification.
 */

export type Stat = { value: string; label: string };

export type StoryContent = {
  eyebrow: string;
  heading: string;
  lede: string;
  claim: string;
  caption: string;
  stats: Stat[];
  eras: { title: string; body: string; image: { src: string; alt: string } }[];
};

export type MomentsContent = {
  eyebrow: string;
  heading: string;
  lede: string;
  items: { title: string; body: string }[];
};

export type CloseContent = {
  eyebrow: string;
  heading: string;
  lede: string;
  cta: string;
  note: string;
};

export type ReviewLandingContent = {
  eyebrow: string;
  heading: string;
  body: string;
  points: string[];
};

export type Pitch = {
  handle: string;
  /** "bracelet" | "ring" — used in any copy that must match the object. */
  kind: "bracelet" | "ring";
  /** Marketing descriptor shown under the title in the buy box (no separator characters). */
  subtitle: string;
  /** Bold strap under the subtitle in the buy box. */
  hook: string;
  story: StoryContent;
  moments: MomentsContent;
};

/* ------------------------------------------------------------------ */
/* Sources — cited in the story band footer. Real links = backlinks.   */
/* ------------------------------------------------------------------ */
export const sources = [
  {
    label: "Hematite (Wikipedia)",
    href: "https://en.wikipedia.org/wiki/Hematite",
  },
  {
    label: "Hematite (Encyclopædia Britannica)",
    href: "https://www.britannica.com/science/hematite",
  },
  {
    label: "Hematite (Mindat.org)",
    href: "https://www.mindat.org/min-1856.html",
  },
  {
    label: "Mohs scale of mineral hardness",
    href: "https://en.wikipedia.org/wiki/Mohs_scale",
  },
];

/* ------------------------------------------------------------------ */
/* The myth, told once, reused everywhere (it's the same stone).       */
/* ------------------------------------------------------------------ */
export const hematiteEras: StoryContent["eras"] = [
  {
    title: "Kings were buried with it",
    body: "Egyptian pharaohs didn’t take hematite to the tomb for decoration. Amulets of this iron went with them to carry their strength into whatever came next. Men have always worn it for what comes next.",
    image: {
      src: "/story/era-1-kings.png",
      alt: "The genuine HimVolt tablet-cut hematite bracelet resting on a carved ancient stone slab, lit by warm torchlight",
    },
  },
  {
    title: "The Greeks called it blood",
    body: "Haimatites, “blood-like,” because the black stone bleeds red when it breaks. Iron is the blood of the earth, and the man who wore it carried a little of that with him. The name stuck because the feeling did.",
    image: {
      src: "/story/era-2-blood.png",
      alt: "A hand pressing the genuine HimVolt hematite bracelet against a ceramic tile, leaving a red-brown streak mark, the mineralogist's streak test",
    },
  },
  {
    title: "The iron is in you",
    body: "Nearly 70% of the stone is iron, the very element that powers the blood in your veins. Warriors, athletes and leaders have worn iron at the wrist since before history was written. Put it on and you carry the same thing they did.",
    image: {
      src: "/story/era-3-iron.png",
      alt: "Close-up of a muscular forearm and wrist wearing the genuine HimVolt hematite bracelet in a gym setting",
    },
  },
  {
    title: "It still hasn’t stopped working",
    body: "Today men still reach for it before the pitch, the interview, the long shift and the hard conversation. Not because anyone told them to. Because it’s what men have done for five thousand years, and it keeps working.",
    image: {
      src: "/story/era-4-today.png",
      alt: "A man adjusting the genuine HimVolt hematite bead bracelet on his wrist at a conference table",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Quality / testing band — mounted on every product page.             */
/* ------------------------------------------------------------------ */
export const quality = {
  eyebrow: "Put to the test",
  heading: "Checked by hand. Only the passers ship.",
  lede: "Before anything leaves our bench it has to clear the same checks that separate real iron oxide from resin, glass and coated lookalikes. Six checks. Zero exceptions.",
  checks: [
    {
      icon: "stone" as const,
      title: "Authenticity: the streak test",
      body: "Scratched against unglazed ceramic, real hematite leaves a red-brown streak, the same test mineralogists have used for two thousand years. Resin, glass and coated beads fail it on the spot.",
    },
    {
      icon: "shield" as const,
      title: "Hardness: 5.5–6.5 Mohs",
      body: "Held to hematite’s own hardness standard, level with hardened steel. If it can’t take the knocks it gets sent back. What ships is what survives.",
    },
    {
      icon: "refresh" as const,
      title: "Daily-wear trial",
      body: "Handled through a full work-and-workout cycle (desk, keys, gym bag) to catch weak beads, loose stones or coating flaws before you ever see them.",
    },
    {
      icon: "fit" as const,
      title: "Fit & tension check",
      body: "Stretch cores are pulled to spec and every bead is aligned bead-by-bead; rings are verified against the sizing gauge so the size on the box is the size on your hand.",
    },
    {
      icon: "check" as const,
      title: "Finish inspection",
      body: "Every surface is checked under light for polish consistency and plating flaws. The shine you see in the photos is the shine that ships.",
    },
    {
      icon: "truck" as const,
      title: "Dispatch & packaging",
      body: "Each order is wrapped to arrive intact and tracked from our bench to your door. If anything arrives damaged, we replace or refund it free.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Generic risk-reversal close (used on every non-flagship product).   */
/* ------------------------------------------------------------------ */
export const closeGeneric: CloseContent = {
  eyebrow: "Covered, or we make it right",
  heading: "Thirty days to decide. Free to fix if it’s wrong.",
  lede: "Every order ships tracked, worldwide, on us. If your piece arrives damaged, missing or wrong, send a photo within 30 days and we replace it or refund it, free, no forms to fight through.",
  cta: "Add it to your bag",
  note: "Dispatched in 1–3 business days · tracked to your door · a human answers within 12 hours",
};

/* ------------------------------------------------------------------ */
/* Generic reviews landing state (shown until a real dataset exists).  */
/* ------------------------------------------------------------------ */
export const reviewsLanding: ReviewLandingContent = {
  eyebrow: "Customer reviews",
  heading: "Verified reviews are being collected.",
  body: "We only publish reviews from confirmed orders, with no cherry-picked quotes, no invented stars, no paid testimonials. The first real ones land as soon as buyers have worn it long enough to have an honest opinion.",
  points: [
    "Photos of the piece as it actually arrived",
    "Star ratings from confirmed orders only",
    "Every review published, the stinging ones included",
  ],
};

/* ------------------------------------------------------------------ */
/* Per-product pitches.                                                */
/* ------------------------------------------------------------------ */
export const pitches: Pitch[] = [
  {
    handle:
      "natural-black-tourmaline-and-hematite-single-strand-round-bead-bracelet",
    kind: "bracelet",
    subtitle:
      "Natural hematite beads in your exact size and finish. Seven sizes, four finishes.",
    hook: "Seven bead sizes, four finishes, one real stone. The piece that fits you exactly.",
    story: {
      eyebrow: "The customisable one",
      heading:
        "Your size. Your finish. The stone that never goes out of style.",
      lede: "Round hematite in the stone’s natural gunmetal or plated in gold, silver and rose-gold, from a barely-there 2mm to a commanding 12mm. Same iron you can verify, sized and finished to disappear into your life.",
      claim:
        "Men don’t wear this because they read about it. They wear it because it works, and it has worked for every generation that ever put it on.",
      caption: "Round natural hematite · 4 finishes, 7 sizes.",
      stats: [
        { value: "7 sizes", label: "2mm to 12mm, find the one that fits you" },
        {
          value: "4 finishes",
          label: "natural gunmetal, gold, silver, rose-gold",
        },
        {
          value: "5.5–6.5",
          label: "Mohs hardness, level with hardened steel",
        },
      ],
      eras: hematiteEras,
    },
    moments: {
      eyebrow: "What it’s for",
      heading: "One stone. Built to fit the way you actually live.",
      lede: "A single real-stone bracelet that matches your wrist, your wardrobe and your week, with the same grounding instinct sized to you.",
      items: [
        {
          title: "Find the exact size",
          body: "From a subtle 2mm that reads as a fine metal line to a 12mm that doesn’t get ignored. If you can imagine it, there’s a size for it.",
        },
        {
          title: "Wear it with anything",
          body: "Gunmetal for the office, gold or silver to finish an outfit, rose-gold when you want it noticed. Four finishes cover every cuff you own.",
        },
        {
          title: "Set it and forget it",
          body: "Stretch core, no clasp, no sizing chart. Roll it on in the morning and stop thinking about it. That’s the point.",
        },
      ],
    },
  },
  {
    handle: "black-gallstone-bracelet-hematite-jewelry-terahertz",
    kind: "bracelet",
    subtitle:
      "107 grams of hand-strung geometric hematite, polished gunmetal black.",
    hook: "107 grams of hematite. The heaviest piece we make, built to be felt.",
    story: {
      eyebrow: "The statement piece",
      heading: "The one that doesn’t whisper. It weighs.",
      lede: "Hand-strung geometric hematite, cut and polished to a dark gunmetal shine, the heaviest piece in the collection at 107 grams. This is the bracelet for men who want to feel the stone on their wrist all day, not glance at it.",
      claim:
        "Men don’t wear this because they read about it. They wear it because it works, and it has worked for every generation that ever put it on.",
      caption: "Hand-strung geometric hematite · 107 g.",
      stats: [
        {
          value: "107 g",
          label: "of iron-dense weight, you’ll feel it all day",
        },
        { value: "Hand-strung", label: "geometric-cut beads, bead by bead" },
        {
          value: "5.5–6.5",
          label: "Mohs hardness, level with hardened steel",
        },
      ],
      eras: hematiteEras,
    },
    moments: {
      eyebrow: "What it’s for",
      heading: "For the days you need to know it’s there.",
      lede: "Weight is the point. This piece was built for men who like their presence felt, on their wrist and in a room.",
      items: [
        {
          title: "Feel it all day",
          body: "107 grams of solid hematite is the difference between wearing jewellery and carrying the stone. You won’t forget it’s on.",
        },
        {
          title: "The geometric cut",
          body: "Faceted beads catch the light where round beads don’t, giving a sharper, more deliberate look under a cuff or rolled-up sleeve.",
        },
        {
          title: "Understated, not quiet",
          body: "Dead-black gunmetal reads as confident minimalism. It layers over a watch or a second band without competing; it just adds weight.",
        },
      ],
    },
  },
  {
    handle: "hematite-ring-without-magnetic-surface",
    kind: "ring",
    subtitle:
      "A solid natural hematite band. No plating, no coating, not magnetic.",
    hook: "A solid band of natural hematite. No coating, no plating. The stone itself.",
    story: {
      eyebrow: "The solid band",
      heading: "The ring for men who don’t wear rings.",
      lede: "A solid hematite band, polished to a dark metallic shine, in sizes 6–12. No plating to chip, no coating to wear through. The colour is the stone itself, and the natural mineral is only weakly magnetic, exactly as we tell you.",
      claim:
        "Men don’t wear this because they read about it. They wear it because it works, and it has worked for every generation that ever put it on.",
      caption: "Solid natural hematite · not plated, not magnetic.",
      stats: [
        { value: "Sizes 6–12", label: "solid band, fits true to US sizing" },
        {
          value: "No plating",
          label: "the colour is the stone, top to bottom",
        },
        {
          value: "5.5–6.5",
          label: "Mohs hardness, level with hardened steel",
        },
      ],
      eras: hematiteEras,
    },
    moments: {
      eyebrow: "What it’s for",
      heading: "A band of iron at the hand that does the work.",
      lede: "Rings are worn where your hands live: typing, shaking, lifting, deciding. That’s exactly where men have always wanted the stone.",
      items: [
        {
          title: "The hand that decides",
          body: "Interviews, handshakes, signings. The ring sits on the hand you do everything important with. A quiet, heavy reminder you’re ready.",
        },
        {
          title: "True solid hematite",
          body: "No plating, no coating, no magnetic composite hiding behind the name. What you see is the mineral, polished and nothing else.",
        },
        {
          title: "Built for every day",
          body: "5.5–6.5 Mohs shrugs off desks and doorframes. Weigh it in your palm once and you’ll know why men have trusted this stone for millennia.",
        },
      ],
    },
  },
  {
    handle: "fashion-curved-hematite-magnetic-ring",
    kind: "ring",
    subtitle:
      "A curved hematite band. Natural or magnetic finish, honestly labelled.",
    hook: "Two finishes: the natural band, or the magnetic pull. Your call.",
    story: {
      eyebrow: "The curved band",
      heading: "The ring you’ll be asked about.",
      lede: "A curved hematite band in two finishes: natural non-magnetic hematite, or the man-made magnetic composite (the “hematine” behind most magnetic jewellery) for the strong-pull sizes. One honest sentence: if it pulls hard, it’s the composite, and we tell you which you’re buying.",
      claim:
        "The men who wear it don’t just like how it looks. They like what it does to a handshake.",
      caption: "Curved hematite band · magnetic & non-magnetic finishes.",
      stats: [
        {
          value: "2 finishes",
          label: "natural hematite or the strong-pull composite",
        },
        {
          value: "Sizes 6–10",
          label: "curved fit that sits low and stays put",
        },
        { value: "Statement", label: "the band people notice across a table" },
      ],
      eras: hematiteEras,
    },
    moments: {
      eyebrow: "What it’s for",
      heading: "Presence, at the end of your hand.",
      lede: "A curved band sits different: lower, closer, more deliberate than a flat ring. This is the one other men notice and ask about.",
      items: [
        {
          title: "The magnetic finish",
          body: "The strong-pull sizes use the man-made magnetic composite that most magnetic jewellery is really made of. We say so, and we sell it for what it is: a ring with presence.",
        },
        {
          title: "The natural finish",
          body: "Want the real mineral? The non-magnetic sizes are pure natural hematite, honestly labelled, with the same curved, low-sitting fit.",
        },
        {
          title: "The one that gets noticed",
          body: "Curved, dark, metallic. It reads as modern and deliberate. Wear it to the table and let it do the talking.",
        },
      ],
    },
  },
];

/** Look up a pitch by handle — undefined for a product with no bespoke pitch. */
export function pitchFor(handle: string): Pitch | undefined {
  return pitches.find((p) => p.handle === handle);
}
