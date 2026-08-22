import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import { product } from "@/lib/product";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "Shop";
const description = `One product, made properly. ${site.promise.shipping}. ${site.promise.returns}.`;

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
        url: absoluteUrl(product.gallery[0].src),
        width: product.gallery[0].width,
        height: product.gallery[0].height,
        alt: product.gallery[0].alt,
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
 * The listing. One card today — the site sells one product — but it is a
 * real grid, not a special case, so a second SKU is a second card, not a
 * rebuild. This page never sells anything itself; every card hands off to
 * /products/[handle], which is the only page with a buy button.
 */
export default function ShopPage() {
  return (
    <main>
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
          One band, one price list, no filler collections. Open it up to pick
          your set.
        </p>
      </div>

      <div className="mx-auto w-full max-w-310 px-5 pt-10 pb-24 sm:px-8 lg:pb-32">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard product={product} />
        </div>
      </div>
    </main>
  );
}
