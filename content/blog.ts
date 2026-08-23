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

import { productPath } from "@/lib/catalog";

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
    slug: "black-tourmaline-bracelet-benefits",
    title: "Black Tourmaline Bracelet Benefits: What the Stone Actually Does",
    excerpt:
      "Black tourmaline gets called a grounding stone, a protective stone, an EMF stone. Here is what is measurable about schorl, what is tradition, and what we will not claim.",
    targetKeyword: "black tourmaline bracelet benefits",
    tags: ["Black tourmaline", "Buying guide"],
    publishedAt: "2026-03-02",
    updatedAt: "2026-03-02",
    readingMinutes: 5,
    coverImage: {
      src: "/blog/black-tourmaline-bracelet-benefits.png",
      alt: "Macro photograph of a black tourmaline beaded bracelet with square-cut stones on a dark surface",
      width: 2528,
      height: 1696,
    },
    body: `
<p>Search "black tourmaline bracelet benefits" and you will get two very different answers stitched together as one: a mineral fact sheet and a spiritual pitch. We think you deserve to know which is which, because we sell the object and we would rather you buy it for the right reason.</p>

<h2>What is actually measurable</h2>
<p>Black tourmaline — mineralogically <strong>schorl</strong> — is one of a short list of minerals that is both <strong>pyroelectric</strong> and <strong>piezoelectric</strong>. Warm it in your palm or apply pressure and it develops a real, documented electrical polarity across its crystal axis. This is not folklore; it is why Dutch traders in the 1700s called tourmaline <em>aschentrekker</em> — "ash-puller" — because a warmed crystal would visibly drag ash out of a pipe bowl. You can find this property in any mineralogy reference.</p>
<p>The second measurable fact is hardness. Schorl sits at 7 to 7.5 on the Mohs scale, ahead of steel (5.5) and most things it will ever knock against on your wrist. That is the entire reason a stone bracelet can survive a gym, a shower, and years of daily wear without pitting or dulling the way a resin or dyed-glass bead will.</p>

<h2>What people wear it for</h2>
<p>Black tourmaline has been carried as a grounding and protective stone across a long list of cultures for a very long time — that is tradition, and we will always tell you it is tradition, not a clinical result. Plenty of people put one on before a flight, a hard conversation, or a long shift for exactly that reason, the same way someone might carry a specific coin or wear a specific watch. It is a small, deliberate object that means something to the person wearing it. That is a legitimate reason to own one.</p>

<h2>What we will not claim</h2>
<p>We are not going to tell you a bracelet will block EMF, fix your sleep, or change your blood pressure. Anyone selling you that certainty is selling you something else. What we will tell you is that you are getting a real, hard, naturally occurring stone with a genuinely unusual electrical property — cut, polished, and strung on an elastic core that will not fall apart in six months.</p>

<h2>How to tell real schorl from a coated bead</h2>
<ul>
<li><strong>Weight.</strong> Natural stone is dense. A full sixteen-stone band should have real heft — ours runs 40 grams.</li>
<li><strong>Temperature.</strong> Real stone feels cool against skin on first contact and warms slowly. Coated glass and resin warm almost instantly.</li>
<li><strong>Opacity.</strong> Schorl is opaque black, not a translucent black-dyed glass that shows light at the edges.</li>
</ul>

<p>If you want the mineral facts on a bracelet you can actually check yourself against that list, <a href="${productPath}">The Tourmaline Band</a> is cut from natural schorl, sixteen square-cut stones on a double-corded elastic core — no clasp, no coating, nothing to fake.</p>
`,
  },
  {
    slug: "best-black-bracelets-for-men",
    title: "The Best Black Bracelets for Men in 2026",
    excerpt:
      "Onyx, lava rock, hematite, black tourmaline — the honest differences between the black stone bracelets men actually buy, and what to check before you do.",
    targetKeyword: "black bracelet men",
    tags: ["Buying guide", "Style"],
    publishedAt: "2026-03-09",
    updatedAt: "2026-03-09",
    readingMinutes: 6,
    coverImage: {
      src: "/blog/best-black-bracelets-for-men.png",
      alt: "Editorial photograph of a man's wrist wearing a black beaded bracelet with a dark suit cuff",
      width: 2528,
      height: 1696,
    },
    body: `
<p>A black bracelet is one of the few pieces of jewellery a man can wear to a client meeting and a gym session without changing anything. The category has exploded, which also means the shelf is full of near-identical listings at wildly different quality. Here is what actually separates them.</p>

<h2>The four materials you will see everywhere</h2>
<p><strong>Lava rock</strong> is cheap, light, and porous — it holds essential oils well, which is the entire reason it exists as a category, but it chips and dulls fast under daily knocks.</p>
<p><strong>Black onyx</strong> is a form of chalcedony, glassy and uniform in colour because it is almost always dyed. It photographs beautifully and wears fine, but the deep black you see in most onyx beads is not the stone's natural colour.</p>
<p><strong>Hematite</strong> is a genuinely dense iron ore with a distinctive metallic sheen rather than a flat black — a different look, worth knowing if that metallic finish is what you actually want.</p>
<p><strong>Black tourmaline (schorl)</strong> is naturally opaque black with no dye, sits at 7–7.5 on the Mohs hardness scale, and is the only one of the four with a documented electrical property (see our <a href="/blog/black-tourmaline-bracelet-benefits">black tourmaline benefits breakdown</a> for the specifics).</p>

<h2>What to check before you buy</h2>
<ul>
<li><strong>Clasp or elastic.</strong> A clasp looks sharper in product photos and is the first thing that fails. An elastic core, properly double-corded, survives years of stretching on and off.</li>
<li><strong>Stone shape.</strong> Round beads are the default because they are the cheapest cut. Square or barrel-cut faces catch light differently and read less like a mass-produced accessory.</li>
<li><strong>Weight.</strong> Pick it up. A real stone bracelet has presence — ours is 40 grams across sixteen stones. If it feels like nothing, it probably is resin.</li>
<li><strong>Sizing without a chart.</strong> The best men's beaded bracelets stretch to fit a range rather than locking you into one exact link count. Ours runs 20cm relaxed and stretches cleanly to a 21cm wrist.</li>
</ul>

<h2>How to wear it</h2>
<p>One band worn alone reads as intentional. Two or three stacked works if they are the same stone family and roughly the same bead size — mixing five different materials on one wrist reads as clutter, not style. Push it up under a shirt cuff for anything formal; let it sit at the wrist bone for everything else.</p>

<h2>The honest bottom line</h2>
<p>If you want a black bracelet that photographs well for under a certain price, onyx or lava rock will do the job. If you want one that is naturally black, genuinely hard-wearing, and has an actual mineral story behind it rather than a dye lot, black tourmaline is the one to buy — and it is the only material on this list you can independently verify with a weight check and a temperature test.</p>

<p><a href="${productPath}">The Tourmaline Band</a> is our take on it: sixteen square-cut natural schorl stones, elastic fit, free tracked shipping, 30-day returns if it is not for you.</p>
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
    updatedAt: "2026-03-16",
    readingMinutes: 5,
    coverImage: {
      src: "/blog/mens-beaded-bracelets-guide.png",
      alt: "Flat lay photograph of three black beaded bracelets arranged on a dark slate surface",
      width: 2528,
      height: 1696,
    },
    body: `
<p>Men's beaded bracelets went from a niche accessory to a default piece of most men's everyday kit in the space of a few years. The style rules did not keep up, which is why most guides on this are either nonexistent or written for a different decade. Here is what actually works.</p>

<h2>Pick a bead size that matches your build</h2>
<p>8mm beads read as understated and work on most wrist sizes. Anything over 10mm starts to look costume-y on a narrower wrist and can genuinely look right on a larger frame. If you are between sizes, go smaller — a bracelet that is slightly too subtle is forgettable; one that is too chunky reads as trying too hard.</p>

<h2>Stacking without looking like a market stall</h2>
<p>The rule that actually holds up: stack bracelets from the same material family, in the same or adjacent tones, at slightly different bead sizes. Two black stone bands of different diameters look deliberate. A black stone band, a leather cord, a woven friendship bracelet and a metal cuff on the same wrist looks like you forgot to take three of them off.</p>
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
<p>Buying one that does not fit. A men's beaded bracelet that is too loose spins constantly and looks unintentional; one that is too tight leaves a mark and eventually stretches the cord unevenly until it snaps. Measure your wrist properly before you buy — most quality bands, including ours, publish a real fit range rather than a single size, because "one size fits most" usually means "one size fits nobody exactly."</p>

<p>If you are shopping for one now: <a href="${productPath}">The Tourmaline Band</a> runs 8mm square-cut stones, fits a 16–21cm wrist on one elastic core, and is priced to actually stack with a second one.</p>
`,
  },
  {
    slug: "protection-bracelets-for-men",
    title: "Protection Bracelets for Men: Tradition, Not a Talisman",
    excerpt:
      "Protection bracelets have been worn across cultures for centuries. Here is the honest history, the stones people reach for, and what a bracelet can and cannot do.",
    targetKeyword: "protection bracelet men",
    tags: ["Black tourmaline", "Tradition"],
    publishedAt: "2026-03-23",
    updatedAt: "2026-03-23",
    readingMinutes: 5,
    coverImage: {
      src: "/blog/protection-bracelets-for-men.png",
      alt: "Close-up photograph of a man's hand and wrist wearing a black stone beaded bracelet",
      width: 2528,
      height: 1696,
    },
    body: `
<p>"Protection bracelet" is one of the most-searched phrases in men's jewellery, and it is also one of the most misunderstood. It does not mean armour. It means a small, worn object that carries meaning for the person wearing it — a tradition that predates the phrase itself by centuries.</p>

<h2>Where the idea actually comes from</h2>
<p>Carrying a stone, a coin, or a cord for protection shows up independently across an enormous range of cultures — evil-eye beads in the Mediterranean and Middle East, red string traditions in East Asia, hamsa charms in North Africa, and black stones like tourmaline and obsidian in Western folk and New Age traditions alike. These traditions developed separately, which tells you something: the impulse to wear a small deliberate object before doing something hard is close to universal, not a modern marketing invention.</p>

<h2>The stones men actually reach for</h2>
<ul>
<li><strong>Black tourmaline (schorl).</strong> Naturally opaque black, genuinely hard (7–7.5 Mohs), and — unlike most "protective" stones — has a real, documented physical property: it is pyroelectric and piezoelectric, meaning it develops measurable electrical polarity when warmed or squeezed.</li>
<li><strong>Obsidian.</strong> Volcanic glass, sharp-edged in its raw form, associated in several traditions with cutting away negative influence.</li>
<li><strong>Hematite.</strong> Dense iron ore with a metallic grey-black sheen, often paired with grounding rather than protection specifically.</li>
<li><strong>Black onyx.</strong> Usually dyed chalcedony, worn more for its uniform black colour and associations with strength and self-control than any specific claim.</li>
</ul>

<h2>What we will say, and what we will not</h2>
<p>We will say this plainly: nothing on your wrist protects you from a bad outcome. A protection bracelet does not replace a seatbelt, a doctor, or good judgement, and any brand implying otherwise is making a claim it cannot back up. What a bracelet like this actually does is smaller and, we think, still worth something — it is a physical reminder, chosen deliberately, that you carry into a hard meeting, a long flight, or a day you needed to feel more solid walking into. That is a real psychological function even if the stone itself has no causal effect on the outcome, and it is the honest reason this category exists.</p>

<h2>Buying one without buying into a false claim</h2>
<p>Look for a seller who tells you what is fact (hardness, weight, whether the stone is natural or dyed) and what is tradition (why people wear it) as two separate things, not blended into one paragraph designed to sound clinical. If a listing promises it will block negative energy or improve your health, that is marketing, not mineralogy.</p>

<p>Our own approach: <a href="${productPath}">The Tourmaline Band</a> is natural schorl, sixteen square-cut stones, 40 grams, elastic fit — sold as what it actually is. Read more on the stone itself in our <a href="/blog/black-tourmaline-bracelet-benefits">black tourmaline benefits guide</a>.</p>
`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
