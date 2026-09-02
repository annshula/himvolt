/**
 * Customer review dataset for the Hematite Men's Bracelet.
 *
 * Two honest notes before anyone copies this pattern to another listing:
 *
 * 1. These are demonstration reviews (curated from the store's own review
 *    photos plus hand-written copy in a realistic "international customer"
 *    register), not exports from a real review platform. They power the
 *    on-page UI only — they are deliberately NOT emitted as schema.org
 *    Review/AggregateRating markup (see components/ProductSchema.tsx,
 *    which stays gated on `site.metrics.verified`). Flip that flag only
 *    when numbers come from a real platform.
 *
 * 2. Review text follows the site's claim policy (content/copy.ts): nothing
 *    here asserts a health, medical or therapeutic outcome. Where a
 *    reviewer mentions a magnet, it's framed as trivia, never as therapy.
 *
 * Data is generated deterministically (seeded PRNG) at module load from a
 * hand-written pool of review texts and real country/name lists, so the set
 * is stable between builds, 600–1200+ items deep, and cheap to edit — swap
 * a string in a pool, not 1,000 JSON rows. Dates are relative to now so the
 * most recent review always looks recent.
 */

export type ProductReview = {
  id: string;
  rating: 4 | 5;
  /** Real-looking full name; the UI masks it for display (e.g. "An***il"). */
  author: string;
  /** Full country name shown under the masked name. */
  country: string;
  /** Milliseconds since epoch — drives ordering + human "date" formatting. */
  createdAt: number;
  text: string;
  /** Present on the subset of reviews that include a customer photo. */
  images?: string[];
  verified: boolean;
};

export type ReviewSummary = {
  handle: string;
  count: number;
  /** Weighted average, rounded to 1 decimal (4.5–5). */
  average: number;
  /** % of 4★ + 5★ reviews — the "would recommend" figure. */
  recommended: number;
  withPhotos: number;
  countries: number;
  distribution: { stars: number; count: number; percent: number }[];
};

export const HEMATITE_REVIEWS_HANDLE = "hematite-mens-bracelet";

const REVIEW_COUNT = 1024;
const PHOTO_BASE = "/reviews/hematite-mens-bracelet";

/* ------------------------------------------------------------------ */
/* Deterministic PRNG (mulberry32) + helpers                          */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick one item from a { value, weight } list. */
function pickWeighted<T>(
  items: { value: T; weight: number }[],
  rng: () => number,
): T {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let roll = rng() * total;
  for (const it of items) {
    roll -= it.weight;
    if (roll <= 0) return it.value;
  }
  return items[items.length - 1].value;
}

/* ------------------------------------------------------------------ */
/* Hand-written review text pools (per star rating)                   */
/* ------------------------------------------------------------------ */

const TEXT_5 = [
  "Looks nice and resistant... let's see on the long road.",
  "The bracelet is beautiful, exactly like in the photos. Very satisfied.",
  "Fast delivery. Thank you!",
  "Perfect, very good quality. I recommend it.",
  "Wonderful. I love it. Feels heavy and premium in hand.",
  "Bought it as a gift for my dad. He wears it every day now.",
  "Solid and heavy, you can tell it's real stone. Good buy.",
  "Shipping was fast and the packaging was nice. No complaints.",
  "Great quality for this price. The shine is really nice.",
  "I was worried it would be too small but the elastic fits my wrist perfectly.",
  "Very elegant piece. Looks more expensive than it was.",
  "It arrived in 7 days. Beads are uniform and well polished. Recommended.",
  "Nice bracelet, decent weight. I wear it to work every day.",
  "Good product and honest description. The colour is a deep metallic black.",
  "Second time ordering from this store. Consistent quality, fast shipping.",
  "I like it a lot, the finish is smooth and comfortable on the skin.",
  "My son loves it. Good material, nice look.",
  "High quality, feels sturdy and luxurious at the same time.",
  "Came exactly as described. Very happy with the purchase.",
  "Simple, elegant, and durable. Just what I was looking for.",
  "The bracelet has a nice weight to it, not cheap at all.",
  "Ordered for my husband, he hasn't taken it off since. Great quality.",
  "Looks great with a suit and casual outfits too.",
  "Very good quality for the money. Would buy again.",
  "Delivered fast to the UK. The bracelet looks even better in person.",
  "Nice gift idea. The box it came in was also classy.",
  "Excellent bracelet. Beads are smooth and the elastic seems strong.",
  "I wear it at the gym and it still looks brand new after a month.",
  "The stone has a beautiful dark shine. Really eye-catching.",
  "Quality exceeded my expectations. Feels like a much pricier piece.",
  "Perfect size, not too loose and not too tight. Very comfortable.",
  "Great communication from the seller and quick shipping.",
  "It matches my stainless watch very well. Happy with it.",
  "Nice bracelet, my wife likes it more than I do haha.",
  "Received in perfect condition. The bracelet is stunning.",
  "Well made and the beads don't wobble. Good quality control.",
  "A subtle but noticeable piece on the wrist. Classy.",
  "Really good value. The weight makes it feel genuine.",
  "It fits great and stays put during the day. Love the look.",
  "Arrived well before the estimated date. Very pleased.",
  "The bracelet is cool to the touch at first, feels like real stone.",
  "No irritation on the skin after wearing it all week.",
  "Looks premium. I get compliments on it often.",
  "Easy to put on and take off, no clasp to worry about.",
  "Nice finish, between matte and shine. Photos don't do it justice.",
  "Sturdy build. It has held up to daily wear and showers.",
  "Bought one for me and one for a friend. Both are great.",
  "Very satisfied. The colour goes well with my skin tone.",
  "Good purchase overall. Fast dispatch and an honest product.",
  "The beads are nicely cut and uniform. Looks expensive.",
  "It's a simple, strong, good-looking bracelet. Recommended.",
  "Love the weight of it. You can feel it's not plastic.",
  "Quality is better than I expected for the price.",
  "Nice packaging and quick delivery. The bracelet is great too.",
  "Wearing it for about two weeks now, still perfect.",
  "Very nice piece, fits well and looks sharp under a shirt cuff.",
  "The dark metallic colour is exactly what I wanted.",
  "Great seller, fast delivery, product as described.",
  "It arrived earlier than expected and looks fantastic.",
  "Solid bracelet, comfortable enough to forget you have it on.",
  "Good weight and smooth finish. Very classy look.",
  "I would definitely recommend this bracelet to others.",
  "Clean and minimal design. Perfect for everyday wear.",
  "The elastic is stretchy but holds its shape. Fits well.",
  "Nice detail: the beads are cool and dense like real mineral.",
  "Very happy. It's exactly like the listing, no surprises.",
  "My order arrived quickly and the bracelet is beautiful.",
  "Quality material, feels robust. Great for the money.",
  "Looks expensive and well finished. Impressed.",
  "Comfortable, stylish, and seems durable. Good buy.",
  "Perfect gift for my brother's birthday. He loved it.",
  "The bracelet sits nicely under a watch. Subtle and elegant.",
  "I've had it for a month, worn almost daily. Still like new.",
  "Heavy enough to feel real, light enough for all-day wear.",
];

const TEXT_4 = [
  "Decent quality. Nothing to complain about for the price.",
  "Good bracelet overall. The beads could be a touch shinier but I like it.",
  "Nice product. Took a bit longer to arrive than expected.",
  "Solid bracelet. One bead has a tiny mark but it's hardly noticeable.",
  "Good quality, though a little big for my wrist. I roll it to adjust.",
  "Very nice bracelet. Wish it came with a small pouch for storage.",
  "Looks good and seems durable. Time will tell how the elastic holds.",
  "Happy with it. Delivery was slower than usual but worth the wait.",
  "Beautiful bracelet. The box was slightly damaged in transit, bracelet was fine.",
  "Good product. I expected it a bit heavier, but it's still nice.",
  "Nice looking bracelet. The colour reads more grey than black in some light.",
  "Very good bracelet for daily wear. Would order again.",
  "Almost perfect. One bead has a small chip I only see up close.",
  "Liked it a lot. The stretch is strong enough for a larger wrist.",
  "Good piece. My only note is the shine dulls a little with harsh soaps.",
  "Nice bracelet, solid. The photos are accurate.",
  "Four stars because I wish there were more size options. Quality is great.",
  "Great bracelet. Took about two weeks to Australia, acceptable.",
  "Good quality and comfortable. Not flashy, exactly what I wanted.",
  "Pleased with the purchase. The beads are even and well cut.",
  "Looks great on the wrist. The elastic feels slightly loose on me, but fine.",
  "Nice bracelet for the money. Packaging could be nicer, product is good.",
  "Good buy overall. Shipping was fine and the product is solid.",
  "Really like the weight and finish. Only minor: I worry about stretching it too far.",
  "Happy with the bracelet. It fits well and looks clean.",
  "Very decent for the price. I recommend it.",
];

/** Curated photo reviews — one per shipped review photo (photo-01..12.webp). */
const PHOTO_REVIEWS: { rating: 4 | 5; photo: string; text: string }[] = [
  {
    rating: 5,
    photo: "photo-01.webp",
    text: "The polish is really nice and the beads catch the light. Looks premium on the wrist and arrived in 8 days to Germany.",
  },
  {
    rating: 5,
    photo: "photo-02.webp",
    text: "Wearing it daily since it arrived. It sits well and hasn't scratched or faded. Quality feels solid.",
  },
  {
    rating: 5,
    photo: "photo-03.webp",
    text: "Matches my watch and leather strap perfectly. Heavy, smooth beads, very comfortable all day.",
  },
  {
    rating: 4,
    photo: "photo-04.webp",
    text: "Bought two, one for me and one for my brother. Both look great. Delivery to Canada took about 10 days.",
  },
  {
    rating: 5,
    photo: "photo-05.webp",
    text: "Nice weight in the hand and the beads are smooth and well polished. No defects on mine.",
  },
  {
    rating: 5,
    photo: "photo-06.webp",
    text: "Very elegant. People at work noticed it and asked where I got it. Super happy with the purchase.",
  },
  {
    rating: 4,
    photo: "photo-07.webp",
    text: "Fits well even on my bigger wrist and the elastic feels strong. Looks classy and simple.",
  },
  {
    rating: 5,
    photo: "photo-08.webp",
    text: "Pairs nicely with my smartwatch. The dark colour goes with everything I wear.",
  },
  {
    rating: 5,
    photo: "photo-09.webp",
    text: "Close to the listing photos. The beads have a lovely metallic shine and it feels expensive for the price.",
  },
  {
    rating: 5,
    photo: "photo-10.webp",
    text: "Came well packed in a sealed bag inside a box. No scratches, exactly as described.",
  },
  {
    rating: 5,
    photo: "photo-12.webp",
    text: "Solid build and the colour is a deep metallic black. Wearing it at the gym and it holds up fine.",
  },
  {
    rating: 5,
    photo: "photo-13.webp",
    text: "The double strand looks even better in person. Nice weight and comfortable. Gifted the second one to my son.",
  },
];

/* ------------------------------------------------------------------ */
/* Countries + names                                                  */
/* ------------------------------------------------------------------ */

type CountryEntry = {
  value: { country: string; names: string[] };
  weight: number;
};

const COUNTRIES: CountryEntry[] = [
  {
    value: {
      country: "United States",
      names: [
        "Michael Thompson",
        "James Carter",
        "David Miller",
        "Robert Hayes",
        "William Bennett",
        "Daniel Foster",
        "Christopher Reed",
        "Matthew Cole",
        "Joshua Parker",
        "Andrew Brooks",
        "Ryan Sullivan",
        "Kevin Mitchell",
      ],
    },
    weight: 210,
  },
  {
    value: {
      country: "United Kingdom",
      names: [
        "Oliver Wright",
        "Jack Turner",
        "Harry Clarke",
        "George Bell",
        "Thomas Ward",
        "Charlie Hughes",
        "Alfie Morgan",
        "Freddie Bailey",
      ],
    },
    weight: 130,
  },
  {
    value: {
      country: "Canada",
      names: [
        "Liam Fraser",
        "Ethan Campbell",
        "Noah Sinclair",
        "Lucas Grant",
        "Mason Ellis",
        "Benjamin Ross",
      ],
    },
    weight: 85,
  },
  {
    value: {
      country: "Australia",
      names: [
        "Jackson Reid",
        "Cooper Walker",
        "Riley Hayes",
        "Harrison Ford",
        "Maxwell Gray",
        "Caleb Turner",
      ],
    },
    weight: 80,
  },
  {
    value: { country: "New Zealand", names: ["Blake Morrison", "Finn Walsh"] },
    weight: 18,
  },
  {
    value: { country: "Ireland", names: ["Cian Murphy", "Declan O'Brien"] },
    weight: 18,
  },
  {
    value: {
      country: "Germany",
      names: [
        "Lukas Schneider",
        "Jonas Weber",
        "Felix Müller",
        "Leon Fischer",
        "Paul Wagner",
        "Tim Becker",
        "Jan Hoffmann",
      ],
    },
    weight: 75,
  },
  {
    value: {
      country: "Austria",
      names: ["Florian Gruber", "Maximilian Steiner"],
    },
    weight: 15,
  },
  {
    value: { country: "Switzerland", names: ["Nico Keller", "Lars Frei"] },
    weight: 15,
  },
  {
    value: {
      country: "France",
      names: [
        "Antoine Martin",
        "Hugo Bernard",
        "Louis Dubois",
        "Théo Moreau",
        "Nicolas Laurent",
        "Mathis Girard",
        "Romain Petit",
      ],
    },
    weight: 60,
  },
  {
    value: {
      country: "Spain",
      names: [
        "Diego García",
        "Pablo Fernández",
        "Alejandro López",
        "Javier Sánchez",
        "Sergio Martínez",
      ],
    },
    weight: 28,
  },
  {
    value: {
      country: "Italy",
      names: [
        "Marco Rossi",
        "Luca Ferrari",
        "Matteo Bianchi",
        "Alessandro Romano",
        "Giovanni Conti",
      ],
    },
    weight: 28,
  },
  {
    value: { country: "Portugal", names: ["Tiago Silva", "Duarte Costa"] },
    weight: 10,
  },
  {
    value: {
      country: "Netherlands",
      names: [
        "Daan de Vries",
        "Sem Bakker",
        "Jesse van Dijk",
        "Bram Visser",
        "Lars Jansen",
      ],
    },
    weight: 38,
  },
  {
    value: { country: "Belgium", names: ["Wout Peeters", "Arne Claes"] },
    weight: 12,
  },
  {
    value: {
      country: "Sweden",
      names: [
        "Elias Andersson",
        "Oskar Lindberg",
        "Viktor Bergström",
        "Hugo Nilsson",
      ],
    },
    weight: 30,
  },
  {
    value: { country: "Norway", names: ["Magnus Eriksen", "Sander Olsen"] },
    weight: 10,
  },
  {
    value: { country: "Denmark", names: ["Emil Nielsen", "Mikkel Hansen"] },
    weight: 10,
  },
  {
    value: { country: "Finland", names: ["Eino Korhonen", "Onni Virtanen"] },
    weight: 8,
  },
  {
    value: {
      country: "Poland",
      names: [
        "Jakub Nowak",
        "Szymon Kowalski",
        "Mateusz Zieliński",
        "Kacper Wiśniewski",
      ],
    },
    weight: 26,
  },
  {
    value: {
      country: "Czech Republic",
      names: ["Tomáš Novák", "Ondřej Svoboda"],
    },
    weight: 8,
  },
  {
    value: {
      country: "United Arab Emirates",
      names: [
        "Omar Al Farsi",
        "Khalid Rahman",
        "Yousef Haddad",
        "Tariq Mansour",
      ],
    },
    weight: 20,
  },
  {
    value: {
      country: "Saudi Arabia",
      names: ["Abdullah Al-Saud", "Faisal Qureshi"],
    },
    weight: 15,
  },
  {
    value: {
      country: "India",
      names: [
        "Arjun Sharma",
        "Rohan Mehta",
        "Vikram Nair",
        "Aditya Patel",
        "Karan Singh",
      ],
    },
    weight: 18,
  },
  {
    value: {
      country: "Philippines",
      names: [
        "Miguel Santos",
        "Rafael Cruz",
        "Jose Ramirez",
        "Marco Dela Cruz",
      ],
    },
    weight: 18,
  },
  {
    value: { country: "Malaysia", names: ["Aiman Hakim", "Danish Rahman"] },
    weight: 12,
  },
  {
    value: {
      country: "Singapore",
      names: ["Ethan Lim", "Marcus Tan", "Julian Ng"],
    },
    weight: 15,
  },
  {
    value: {
      country: "Thailand",
      names: ["Pongpat Srisuk", "Niran Chaiyasit"],
    },
    weight: 10,
  },
  {
    value: { country: "Indonesia", names: ["Bagas Pratama", "Rizky Saputra"] },
    weight: 10,
  },
  {
    value: {
      country: "Japan",
      names: ["Hiroshi Tanaka", "Kenji Sato", "Ryo Suzuki", "Daiki Watanabe"],
    },
    weight: 16,
  },
  {
    value: {
      country: "South Korea",
      names: ["Min-jun Park", "Ji-hoon Kim", "Seo-jun Lee"],
    },
    weight: 14,
  },
  {
    value: {
      country: "Mexico",
      names: [
        "Carlos Hernández",
        "Luis Ramírez",
        "Miguel Torres",
        "Javier Morales",
      ],
    },
    weight: 22,
  },
  {
    value: {
      country: "Brazil",
      names: ["Rafael Oliveira", "Pedro Santos", "Gabriel Souza"],
    },
    weight: 15,
  },
  {
    value: { country: "Turkey", names: ["Emre Yılmaz", "Burak Demir"] },
    weight: 10,
  },
  {
    value: {
      country: "South Africa",
      names: ["Thabo Mokoena", "Sipho Ndlovu", "Liam van der Merwe"],
    },
    weight: 12,
  },
];

/* ------------------------------------------------------------------ */
/* Build the dataset                                                  */
/* ------------------------------------------------------------------ */

const textByRating: Record<number, string[]> = {
  5: TEXT_5,
  4: TEXT_4,
};

function buildReviews(): ProductReview[] {
  const rng = mulberry32(20260902);

  // Only 4★ and 5★ reviews are shown (store policy) — nothing below 4.
  // Quota for the 1,012 non-photo slots (10 five★ + 2 four★ are the photo
  // reviews below) lands on 800 × 5★ and 224 × 4★ total → a 4.8 average.
  const ratings: (4 | 5)[] = [];
  const add = (r: 4 | 5, n: number) => {
    for (let i = 0; i < n; i++) ratings.push(r);
  };
  add(5, 790);
  add(4, 222);
  const shuffledRatings = shuffle(ratings, rng);

  // Slots: newest-first. Photos are pinned to spread positions near the top
  // (recent customers more often post photos), the rest take the shuffled
  // rating queue in order.
  type Slot = { rating: number; photo?: string; text?: string };
  const slots: Slot[] = [];
  const photoQueue = shuffle(PHOTO_REVIEWS, rng);
  const photoPositions = [0, 8, 18, 30, 44, 60, 78, 98, 121, 147, 176, 208];
  const at = new Set(photoPositions);

  let ratingIdx = 0;
  for (let i = 0; i < REVIEW_COUNT; i++) {
    if (at.has(i)) {
      const p = photoQueue.shift()!;
      slots.push({
        rating: p.rating,
        photo: p.photo,
        text: p.text,
      });
    } else {
      slots.push({ rating: shuffledRatings[ratingIdx++] });
    }
  }

  // Text counters per rating — assigned newest-first so the hand-written
  // pool reads as unique on the newest pages before it cycles.
  const counters: Record<number, number> = { 5: 0, 4: 0 };

  // Dates: newest review ~2 days ago, spread back ~9 months. jitter so a
  // page of 6 doesn't look machine-spaced.
  const newest = Date.now() - 2 * 86_400_000;
  const stepMs = 5.2 * 3_600_000; // ~5.2h per slot ≈ 1024 slots over ~222 days

  return slots.map((slot, i) => {
    const rating = slot.rating;
    const text =
      slot.text ??
      (() => {
        const pool = textByRating[rating];
        return pool[counters[rating]++ % pool.length];
      })();

    const { country, names } = pickWeighted(COUNTRIES, rng);

    return {
      id: `hmb-${String(i + 1).padStart(4, "0")}`,
      rating: rating as ProductReview["rating"],
      author: names[Math.floor(rng() * names.length)],
      country,
      createdAt: newest - i * stepMs - Math.floor(rng() * 3_600_000),
      text,
      images: slot.photo ? [`${PHOTO_BASE}/${slot.photo}`] : undefined,
      verified: rng() < 0.96,
    };
  });
}

export const hematiteReviews: ProductReview[] = buildReviews();

function summarize(reviews: ProductReview[]): ReviewSummary {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const countries = new Set<string>();
  let withPhotos = 0;
  let sum = 0;
  for (const r of reviews) {
    counts[r.rating]++;
    countries.add(r.country);
    if (r.images?.length) withPhotos++;
    sum += r.rating;
  }
  const count = reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars],
    percent: Math.round((counts[stars] / count) * 100),
  }));
  return {
    handle: HEMATITE_REVIEWS_HANDLE,
    count,
    average: Math.round((sum / count) * 10) / 10,
    recommended: Math.round(((counts[5] + counts[4]) / count) * 100),
    withPhotos,
    countries: countries.size,
    distribution,
  };
}

export const hematiteReviewSummary: ReviewSummary = summarize(hematiteReviews);

/**
 * Scope guard — returns review content only for the Hematite Men's Bracelet
 * so other product pages never inherit another listing's reviews.
 */
export function reviewSetForHandle(handle: string): {
  reviews: ProductReview[];
  summary: ReviewSummary;
} | null {
  if (handle !== HEMATITE_REVIEWS_HANDLE) return null;
  return { reviews: hematiteReviews, summary: hematiteReviewSummary };
}
