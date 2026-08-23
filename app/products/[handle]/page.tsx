import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductSpecShowcase } from "@/components/product/ProductSpecShowcase";
import Reviews from "@/components/sections/Reviews";
import ProductSchema from "@/components/ProductSchema";
import { getProductByHandle, products } from "@/lib/product";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
import { getProduct } from "@/lib/shopify";
import { pathForHandle } from "@/lib/catalog";

export const revalidate = 3600;

/**
 * Every product this store sells (lib/product.ts) gets a page. Handles are
 * whatever Shopify's currently are (data/product.json, refreshed by
 * `npm run shopify:sync-product`) — not hardcoded slugs. A product rename
 * upstream and a re-sync changes routes; there is nothing else to keep in
 * sync.
 */
export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  return params.then(({ handle }) => {
    const product = getProductByHandle(handle);
    if (!product) {
      return { title: "Product not found", robots: { index: false, follow: false } };
    }

    const path = pathForHandle(product.handle);
    const { title } = product;
    const description = `${product.subtitle}. ${site.promise.shipping}. ${site.promise.returns}.`;
    const cover = product.gallery[0];

    return {
      title,
      description,
      alternates: { canonical: path },
      openGraph: {
        type: "website",
        title: `${title} · ${site.name}`,
        description,
        url: absoluteUrl(path),
        siteName: site.name,
        images: [
          {
            url: cover.src,
            width: cover.width,
            height: cover.height,
            alt: cover.alt,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} · ${site.name}`,
        description,
        images: [cover.src],
      },
      other: {
        "product:brand": site.name,
        "product:availability": "in stock",
      },
    };
  });
}

/**
 * The product detail page — the only page on the site with a buy button.
 * One sticky two-column split: gallery on the left, everything a shopper
 * needs to decide and buy on the right (title, price, pack picker, "Add to
 * bag"), specs and reviews underneath. Mirrors the reference build's
 * gallery + buy-box pattern rather than the old page-then-separate-section
 * layout.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) notFound();

  // Synced catalog data (data/product.json) — pricing, stock and photography.
  const liveProduct = await getProduct(handle);

  return (
    <main>
      <ProductSchema product={liveProduct} />

      <div className="mx-auto w-full max-w-310 px-5 pt-12 sm:px-8 sm:pt-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] text-ink-mute"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <span className="max-w-[20ch] truncate text-ink-soft">
            {product.title}
          </span>
        </nav>
      </div>

      <ProductPurchase product={liveProduct} />

      <ProductSpecShowcase product={liveProduct} />

      <Reviews />
    </main>
  );
}
