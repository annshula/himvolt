import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import Showcase from "@/components/sections/Showcase";
import Guarantee from "@/components/sections/Guarantee";
import Comparison from "@/components/sections/Comparison";
import Stone from "@/components/sections/Stone";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Schema from "@/components/Schema";

/**
 * The home page explains the collection — men's power gear for body and
 * mind: what it is, which half of it fits you, and why it is worth the
 * money. It never asks for the sale directly; every CTA on it hands off to
 * the shop listing (/shop) or a product page. No live data to fetch here, so
 * the whole page is static.
 *
 * Order is deliberate: Hero hooks, TrustBar earns a first second of trust,
 * Showcase shows the two halves (physical / mental) and the "best fit"
 * picker, Guarantee removes purchase-anxiety objections right after
 * (shipping/returns/checkout/honest claims) while they're front of mind,
 * Stone carries the mental-side story, Comparison backs up "genuine" with a
 * real table instead of just asserting it, Faq closes remaining objections,
 * FinalCta asks for the sale once — at the end, having earned it.
 *
 * There is deliberately no reviews band here: the testimonials in
 * content/copy.ts are written placeholders, not customers, and the product
 * pages already carry the real review feed. Add it back once there are
 * verified quotes to show.
 */
export default function Home() {
  return (
    <>
      <Schema />
      <main>
        <Hero />
        <TrustBar />
        <Showcase />
        <Guarantee />
        <Stone />
        <Comparison />
        <Faq />
        <FinalCta />
      </main>
    </>
  );
}
