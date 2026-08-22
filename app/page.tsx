import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import Showcase from "@/components/sections/Showcase";
import Stone from "@/components/sections/Stone";
import Features from "@/components/sections/Features";
import Reviews from "@/components/sections/Reviews";
import Faq from "@/components/sections/Faq";
import Schema from "@/components/Schema";

/**
 * The home page explains the product — what it is, why tourmaline, why it is
 * worth the money. It never asks for the sale directly; every CTA on it hands
 * off to /products/the-tourmaline-band, the only page that does. No live data
 * to fetch here, so the whole page is static.
 */
export default function Home() {
  return (
    <>
      <Schema />
      <main>
        <Hero />
        <TrustBar />
        <Showcase />
        <Stone />
        <Features />
        <Reviews />
        <Faq />
      </main>
    </>
  );
}
