import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import Showcase from "@/components/sections/Showcase";
import Stone from "@/components/sections/Stone";
import Features from "@/components/sections/Features";
import Collection from "@/components/sections/Collection";
import Reviews from "@/components/sections/Reviews";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Schema from "@/components/Schema";
import { getProduct } from "@/lib/shopify";

// Statically rendered, revalidated hourly so live Shopify pricing can flow in
// without giving up the static HTML that makes the page fast.
export const revalidate = 3600;

export default async function Home() {
  const product = await getProduct();

  return (
    <>
      <Schema product={product} />
      <main>
        <Hero />
        <TrustBar />
        <Showcase />
        <Stone />
        <Features />
        <Collection product={product} />
        <Reviews />
        <Faq />
        <FinalCta />
      </main>
    </>
  );
}
