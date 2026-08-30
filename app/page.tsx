import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import Showcase from "@/components/sections/Showcase";
import Guarantee from "@/components/sections/Guarantee";
import Comparison from "@/components/sections/Comparison";
import Stone from "@/components/sections/Stone";
import Reviews from "@/components/sections/Reviews";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Schema from "@/components/Schema";

/**
 * The home page explains the product — what it is, why hematite, why it is
 * worth the money. It never asks for the sale directly; every CTA on it hands
 * off to the shop listing (/shop). No live data to fetch here, so the whole
 * page is static.
 *
 * Order is deliberate: Hero hooks, TrustBar earns a first second of trust,
 * Showcase shows the object, Guarantee removes purchase-anxiety objections
 * right after (shipping/returns/checkout/genuine) while they're front of
 * mind, Comparison backs up "genuine" with a real table instead of just
 * asserting it, Stone carries the brand story, Reviews is social proof,
 * Faq closes remaining objections, FinalCta asks for the sale once — at
 * the end, having earned it.
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
        <Comparison />
        <Stone />
        <Reviews />
        <Faq />
        <FinalCta />
      </main>
    </>
  );
}
