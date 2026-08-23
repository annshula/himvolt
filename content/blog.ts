/**
 * Blog post content. Same pattern as content/copy.ts and lib/product.ts —
 * plain data, kept out of components so posts can be edited without touching
 * page code. `body` is author-controlled HTML (same trust model as
 * lib/product.ts's descriptionHtml), never user input.
 *
 * Topics and target keywords were picked from Google Trends US search
 * interest (12mo), not guessed: each post targets a term that showed real,
 * non-zero volume — see the `targetKeyword` field. Claim policy carries over
 * from content/copy.ts unchanged: mineral properties are described as fact,
 * everything else is framed as tradition/culture, never as a health or
 * medical outcome.
 */

import { pathForHandle, productPath } from "@/lib/catalog";

export type BlogPost = {
  slug: string;
  title: string;
  /** Meta description + card excerpt. Kept under ~155 chars for SERP display. */
  excerpt: string;
  targetKeyword: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  coverImage: { src: string; alt: string; width: number; height: number };
  body: string;
};

const author = "The HimVolt Team";
export { author as blogAuthor };

export const blogPosts: BlogPost[] = [
  {
    slug: "hematite-bracelet-benefits",
    title: "Hematite Bracelet Benefits: What the Stone Actually Does",
    excerpt:
      "Hematite gets called a grounding stone, a focus stone, a confidence stone. Here is what is measurable about iron oxide, what is tradition, and what we will not claim.",
    targetKeyword: "hematite bracelet benefits",
    tags: ["Hematite", "Buying guide"],
    publishedAt: "2026-03-02",
    updatedAt: "2026-08-23",
    readingMinutes: 5,
    coverImage: {
      src: "/blog/black-tourmaline-bracelet-benefits.webp",
      alt: "Macro photograph of a polished hematite beaded bracelet on a dark surface",
      width: 2528,
      height: 1696,
    },
    body: `
<p>Search "hematite bracelet benefits" and you will get two very different answers stitched together as one: a mineral fact sheet and a spiritual pitch. We think you deserve to know which is which, because we sell the object and we would rather you buy it for the right reason.</p>

<h2>What is actually measurable</h2>
<p>Hematite is <strong>iron(III) oxide</strong> — Fe₂O₃ — one of the most abundant iron ores on Earth. Its name comes from the Greek <em>haimatites lithos</em>, "blood-like stone," coined by the naturalist Theophrastus around 300 BCE. The reason is not the stone's colour, which is a metallic black-grey. It's the streak: scratch hematite against an unglazed surface and it leaves a deep red-brown mark, the same iron oxide showing through. That streak test is still the standard way mineralogists identify it today.</p>
<p>The second measurable fact is density and hardness. Hematite sits at 5.5 to 6.5 on the Mohs scale — roughly level with hardened steel — and its iron content makes it notably dense: pick up a real piece and it is heavier in hand than a stone its size has any right to be. That weight is the fastest way to tell a genuine hematite bead from a lighter imitation.</p>

<h2>What people wear it for</h2>
<p>Hematite has been carried since antiquity — Egyptian amulets, Mesopotamian cylinder seals, and centuries of grounding and protective folk tradition since. That is tradition, and we will always tell you it is tradition, not a clinical result. Today it is one of the most-searched stones for regaining a sense of grounding, focus, confidence and resilience — the kind of thing people reach for before a hard meeting, a long shift, or a day that calls for feeling steadier. It is a small, deliberate object that means something to the person wearing it. That is a legitimate reason to own one.</p>

<h2>What we will not claim</h2>
<p>We are not going to tell you a bracelet will fix your focus, calm your nerves, or change your day for you. Anyone selling you that certainty is selling you something else. What we will tell you is that you are getting a real, dense, naturally occurring iron ore with a genuinely old story — cut, polished, and strung on an elastic core that will not fall apart in six months.</p>

<h2>How to tell real hematite from a coated bead</h2>
<ul>
<li><strong>Weight.</strong> Iron oxide is dense. If a "hematite" bracelet feels light, it probably is not hematite.</li>
<li><strong>Temperature.</strong> Real stone feels cool against skin on first contact and warms slowly. Coated glass and resin warm almost instantly.</li>
<li><strong>The streak test.</strong> A scratch on an unglazed ceramic tile leaves red-brown on real hematite. We would not recommend testing your own jewellery this way, but it is the reason the "blood stone" name has stuck for two thousand years.</li>
</ul>

<p>If you want a bracelet cut from the real mineral, <a href="${productPath}">the Hematite Men's Bracelet</a> is a single strand of polished natural hematite on a stretch elastic core — no clasp, no coating, nothing to fake.</p>
`,
  },
  {
    slug: "hematite-stone-bracelet-guide",
    title: "Hematite Stone Bracelet: A No-Nonsense Buying Guide",
    excerpt:
      'Natural hematite, gold-plated hematite, magnetic hematite, hematine — the honest differences between what gets sold as a "hematite bracelet," and what to check before you buy.',
    targetKeyword: "hematite stone bracelet",
    tags: ["Buying guide", "Hematite"],
    publishedAt: "2026-03-09",
    updatedAt: "2026-08-23",
    readingMinutes: 6,
    coverImage: {
      src: "/blog/best-black-bracelets-for-men.webp",
      alt: "Editorial photograph of a man's wrist wearing a metallic hematite beaded bracelet with a dark suit cuff",
      width: 2528,
      height: 1696,
    },
    body: `
<p>"Hematite bracelet" covers a wider range of actual products than almost any other stone category — natural, plated, magnetic, and outright synthetic all get sold under the same name. None of that makes it a bad stone to buy. It just means the listing title tells you less than you think it does.</p>

<h2>What "hematite bracelet" can actually mean</h2>
<p><strong>Natural hematite</strong> is the real mineral: iron oxide, metallic grey-black, dense, and cool to the touch, sitting at 5.5–6.5 on the Mohs scale. This is what a "raw" or "natural finish" listing should mean.</p>
<p><strong>Plated hematite</strong> — gold-plated, silver-plated, rose-gold-plated — is genuine hematite underneath a thin metal coating for colour. Still real stone, different surface finish, and the plating will wear thinner over years of contact with skin than the natural finish will.</p>
<p><strong>Magnetic hematite</strong> is the one to read carefully. Natural hematite is only weakly magnetic — nowhere near strong enough to be marketed as "magnetic therapy" jewellery. What is actually sold as magnetic hematite is almost always a man-made composite, often called <strong>hematine</strong>, engineered to be strongly magnetic. It is not a scam, but it is not the natural mineral either, and any seller who does not say so is leaving out a fact that matters.</p>

<h2>What to check before you buy</h2>
<ul>
<li><strong>Does the listing say "natural" or "magnetic"?</strong> If it says magnetic and does not mention hematine or "man-made," ask before you buy.</li>
<li><strong>Weight.</strong> Pick it up. Real hematite has presence — light beads that look metallic are usually glass or plastic with a metallic coating.</li>
<li><strong>Elastic or clasp.</strong> A clasp looks sharper in photos and is the first thing to fail. A properly corded elastic survives years of stretching on and off.</li>
<li><strong>Sizing without a chart.</strong> A stretch cord that adapts to a wrist range beats a fixed link count that locks you into one size.</li>
</ul>

<h2>The honest bottom line</h2>
<p>If you want the real mineral — dense, cool, genuinely old as a worn stone — buy a natural or plated hematite piece and know which one you are getting. If you specifically want the strong magnetic pull, that is hematine, and a seller worth buying from will tell you that plainly rather than let "hematite" do the work of implying it is natural.</p>

<p>Our own collection is built on exactly that distinction: the <a href="${productPath}">Hematite Men's Bracelet</a> and the Hematite Round Bead Bracelet are natural or plated hematite, no exceptions — and where we sell a magnetic piece, we say so on the product page, not just in the fine print.</p>
`,
  },
  {
    slug: "mens-beaded-bracelets-guide",
    title: "Men's Beaded Bracelets: A No-Nonsense Style Guide",
    excerpt:
      "How to actually wear a men's beaded bracelet — stacking, sizing, pairing with a watch, and the mistakes that make a good bracelet look cheap.",
    targetKeyword: "mens beaded bracelets",
    tags: ["Style", "How-to"],
    publishedAt: "2026-03-16",
    updatedAt: "2026-08-23",
    readingMinutes: 5,
    coverImage: {
      src: "/blog/mens-beaded-bracelets-guide.webp",
      alt: "Flat lay photograph of three metallic hematite beaded bracelets arranged on a dark slate surface",
      width: 2528,
      height: 1696,
    },
    body: `
<p>Men's beaded bracelets went from a niche accessory to a default piece of most men's everyday kit in the space of a few years. The style rules did not keep up, which is why most guides on this are either nonexistent or written for a different decade. Here is what actually works.</p>

<h2>Pick a bead size that matches your build</h2>
<p>Beads in the 6–8mm range read as understated and work on most wrist sizes. Anything over 10mm starts to look costume-y on a narrower wrist and can genuinely look right on a larger frame. If you are between sizes, go smaller — a bracelet that is slightly too subtle is forgettable; one that is too chunky reads as trying too hard.</p>

<h2>Stacking without looking like a market stall</h2>
<p>The rule that actually holds up: stack bracelets from the same material family, in the same or adjacent tones, at slightly different bead sizes. Two dark metallic stone bands of different diameters look deliberate. A stone band, a leather cord, a woven friendship bracelet and a metal cuff on the same wrist looks like you forgot to take three of them off.</p>
<p>Two is the safest stack for daily wear. Three works for a night out. Beyond that you are into festival territory, which is its own look and not the one most men reading this want.</p>

<h2>Wearing it with a watch</h2>
<p>Put the bracelet on the opposite wrist from your watch if you want each piece to actually register on its own. If you only wear one wrist for everything, push the bracelet up closer to the elbow side of the watch rather than jammed against the case — a beaded bracelet clacking against a watch case all day is how both end up scratched.</p>

<h2>Occasions: when to leave it on, when to take it off</h2>
<ul>
<li><strong>Client meetings, interviews:</strong> Leave a single, subtle band on. It reads as personal, not distracting.</li>
<li><strong>Black tie:</strong> Take it off. This is the one context where any stacked jewellery reads as a miss.</li>
<li><strong>Gym, swimming, showering:</strong> A genuine stone bracelet on a proper elastic core handles all three. Resin and dyed glass do not age well under repeated water exposure — check what you actually bought before you assume it can take it.</li>
</ul>

<h2>The one mistake that ages a bracelet fastest</h2>
<p>Buying one that does not fit. A men's beaded bracelet that is too loose spins constantly and looks unintentional; one that is too tight leaves a mark and eventually stretches the cord unevenly until it snaps. A stretch elastic core sized to a real wrist range — not a single fixed link count — is what most quality bands, including ours, are built on for exactly this reason.</p>

<p>If you are shopping for one now: <a href="${productPath}">the Hematite Men's Bracelet</a> is a single strand of polished natural hematite on one elastic core, priced to actually stack with a second piece from the collection.</p>
`,
  },
  {
    slug: "hematite-ring-meaning-breaking",
    title: "Hematite Ring Meaning: Why They Crack, and What It Actually Means",
    excerpt:
      "A hematite ring breaking is one of the most-searched questions about the stone. Here is the folklore, the real physical reason, and magnetic vs. natural hematite explained.",
    targetKeyword: "hematite ring meaning",
    tags: ["Hematite", "Rings"],
    publishedAt: "2026-03-23",
    updatedAt: "2026-08-23",
    readingMinutes: 5,
    coverImage: {
      src: "/blog/protection-bracelets-for-men.webp",
      alt: "Close-up photograph of a polished hematite ring on a hand",
      width: 2528,
      height: 1696,
    },
    body: `
<p>"Hematite ring meaning" and "why did my hematite ring break" are two of the most-searched questions about this stone — often from someone whose ring genuinely just cracked and wants to know if it means something. We will give you the honest version of both the folklore and the physics.</p>

<h2>The folklore</h2>
<p>In a lot of crystal and grounding traditions, a hematite piece breaking is read as the stone having "done its job" — absorbed something so you did not have to carry it. It is a real, widely repeated tradition, and we are not going to tell you it is wrong to find meaning in it. We are also not going to tell you it is a documented mechanism, because it is not. What follows is the physical explanation, which is separate from — not a replacement for — whatever meaning you take from it.</p>

<h2>The real reason rings crack</h2>
<p>Hematite sits at 5.5–6.5 on the Mohs scale: hard, but not tough in the engineering sense. Hardness measures resistance to scratching; toughness measures resistance to a sudden shock cracking straight through — and hematite, like most polished mineral rings, is fairly brittle under a sharp impact even though its surface is hard to scratch. A ring takes far more sudden mechanical stress than a bracelet bead ever does: knocked against a doorframe, gripped tight during a workout, or squeezed under a glove in the cold. Any of those can crack a solid stone ring in an instant, which is exactly the moment it tends to get remembered and explained.</p>
<p>A ring sized too tight adds constant low-level pressure on top of any impact, which is the single most common cause we would point to first if someone told us their ring cracked without an obvious knock.</p>

<h2>Magnetic hematite rings: a separate thing worth knowing</h2>
<p>A large share of "hematite ring" searches are actually about <strong>magnetic hematite rings</strong>, and this is where the naming gets genuinely misleading across the market. Natural hematite is only weakly magnetic. What is sold as "magnetic hematite" is almost always a man-made composite — often called <strong>hematine</strong> — engineered to be strongly magnetic, not the natural stone pulled from the ground. It is not fake jewellery, but it is a different material with different durability: the composite is generally more brittle than a solid natural hematite band, which is one more reason magnetic rings crack more often than non-magnetic ones in the same collection.</p>

<h2>What we sell, and what we tell you about it</h2>
<p>Our <a href="${pathForHandle("hematite-ring-without-magnetic-surface")}">Hematite Band Ring</a> is solid, natural, non-magnetic hematite — no plating, no coating, the colour is the stone. Our Curved Hematite Ring is sold in both a natural non-magnetic finish and a magnetic hematine finish, and we say which is which on the product page rather than leaving "hematite" to imply the wrong one. If a ring is important enough to wear daily, it is worth knowing which material you actually bought.</p>
`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
