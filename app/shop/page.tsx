import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { products } from "@/lib/product";
import { getProduct } from "@/lib/shopify";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "Shop";
const description = `Hematite bracelets and rings, sourced honestly. ${site.promise.shipping}. ${site.promise.returns}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/shop" },
  openGraph: {
    type: "website",
    title: `${title} · ${site.name}`,
    description,
    url: absoluteUrl("/shop"),
    siteName: site.name,
    images: [
      {
        url: products[0].gallery[0].src,
        width: products[0].gallery[0].width,
        height: products[0].gallery[0].height,
        alt: products[0].gallery[0].alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
  },
};

/**
 * The listing — every product this store sells, one card each. This page
 * never sells anything itself; every card hands off to /products/[handle],
 * the only page with a buy button.
 */
export default async function ShopPage() {
  // Live Shopify pricing/stock for every product — same source BuyBox uses
  // on each product page, so "From $X" here never drifts from what checkout
  // actually charges.
  const liveProducts = await Promise.all(
    products.map((p) => getProduct(p.handle)),
  );

  return (
    <main>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
        ]}
      />
      <div className="mx-auto w-full max-w-310 px-5 pt-12 pb-2 sm:px-8 sm:pt-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] text-ink-mute"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-soft">Shop</span>
        </nav>

        <h1 className="font-display mt-7 text-[clamp(2rem,1.5rem+2.2vw,3.2rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink">
          Shop HimVolt
        </h1>
        <p className="mt-3 max-w-[52ch] text-[0.95rem] leading-relaxed text-ink-soft">
          Hematite bracelets and rings, sourced honestly. Open one up to see the
          full spec.
        </p>
      </div>

      <div className="mx-auto w-full max-w-310 px-5 pt-10 pb-24 sm:px-8 lg:pb-32">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {liveProducts.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
