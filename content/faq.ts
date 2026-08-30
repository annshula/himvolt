/**
 * The full FAQ page (/faq) — a superset of the compact homepage FAQ
 * (content/copy.ts `faqs`), grouped by topic. New entries here target real,
 * measured search queries (Google Trends US, 12mo) the homepage list didn't
 * cover, the same policy content/blog.ts follows for blog topics — see the
 * targetKeyword-style reasoning there. Claim policy carries over unchanged:
 * mineral fact stays fact, meaning/tradition stays labelled as tradition,
 * and the natural-vs-magnetic distinction is never blurred.
 */

import { productPath } from "@/lib/catalog";
import { faqs as homepageFaqs } from "@/content/copy";

export type FaqEntry = { q: string; a: string };
export type FaqGroup = { title: string; items: FaqEntry[] };

export const faqGroups: FaqGroup[] = [
  {
    title: "What hematite actually is",
    items: [
      {
        q: "What does hematite mean?",
        a: "Two different things, and worth keeping separate. The name itself comes from the Greek haimatites lithos — \"blood-like stone\" — because a scratch on its black metallic surface leaves a red-brown streak. Separately, in crystal and folk tradition, hematite has carried a meaning of grounding, protection and steadiness since antiquity. That second meaning is a cultural tradition, not a measured property of the mineral, and we will always tell you which is which.",
      },
      {
        q: "Is hematite magnetic?",
        a: "Natural hematite is only very weakly magnetic — not enough to notice or rely on. What actually sticks to a fridge magnet is hematine, a man-made magnetic composite sometimes sold under the hematite name because it shares the black metallic look. If a listing anywhere is described as magnetic, it is hematine, not natural stone, and the product page should say so plainly. Every non-magnetic piece in this collection is genuine hematite, iron oxide, tested the same way mineralogists test it — the streak.",
      },
      {
        q: "What colour is hematite?",
        a: "On the surface, a metallic black-to-steel-grey — that is what you see and feel. Underneath, hematite is red-brown, which only shows if you scratch it: the streak test mineralogists use to identify it. Both colours are the same iron oxide; the metallic sheen is just how densely-packed crystals reflect light.",
      },
      {
        q: "Is hematite a rock, a mineral, or a crystal?",
        a: "Mineralogically, hematite is a mineral — a naturally occurring iron oxide, Fe₂O₃, with a specific crystal structure. \"Rock\" and \"crystal\" both get used loosely for it in everyday language and neither is wrong exactly, but \"mineral\" is the precise term. It is one of the most abundant iron ores on Earth, mined for iron long before it was ever cut for jewellery.",
      },
    ],
  },
  {
    title: "Buying and wearing",
    items: [
      ...homepageFaqs
        .filter((f) => f.q === "Will it fit my wrist?" || f.q === "Is this real stone or a coated bead?" || f.q === "What are the benefits of a hematite bracelet?")
        .map((f) => ({ q: f.q, a: f.a })),
      {
        q: "Do hematite bracelets actually work?",
        a: `Depends what "work" means. As a physical object: yes — it is a real, dense, hard-wearing mineral that will outlast a lot of costume jewellery. As a fix for focus, stress or luck: no reputable seller can honestly promise that, us included, and we would rather say so than sell you a maybe. See our full breakdown at <a href="/blog/do-hematite-bracelets-work">do hematite bracelets actually work</a> for the longer answer.`,
      },
      {
        q: "Do you sell hematite necklaces?",
        a: `Not currently — the collection is bracelets and rings only. If that changes we will say so here rather than let a search engine tell you otherwise. In the meantime, <a href="${productPath}">the Hematite Men's Bracelet</a> uses the same single-strand, no-clasp build across every piece we do sell.`,
      },
    ],
  },
  {
    title: "Shipping and returns",
    items: homepageFaqs
      .filter((f) => f.q.startsWith("How long does delivery") || f.q.startsWith("What if I don't like it"))
      .map((f) => ({ q: f.q, a: f.a })),
  },
  {
    title: "Care",
    items: homepageFaqs
      .filter((f) => f.q.startsWith("Can I wear it in the shower"))
      .map((f) => ({ q: f.q, a: f.a })),
  },
];

export const allFaqs: FaqEntry[] = faqGroups.flatMap((g) => g.items);
