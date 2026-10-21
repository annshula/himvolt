import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPurchase } from "@/components/product/ProductPurchase";
import { SaleCountdown } from "@/components/product/SaleCountdown";
import { ProductDetails } from "@/components/product/ProductDetails";
import BraceletStory from "@/components/product/BraceletStory";
import BraceletMoments from "@/components/product/BraceletMoments";
import BraceletVersus from "@/components/product/BraceletVersus";
import BraceletClose from "@/components/product/BraceletClose";
import ReviewsComing from "@/components/product/ReviewsComing";
import QualityTests from "@/components/product/QualityTests";
import BuildSection from "@/components/product/BuildSection";
import ProductReviews from "@/components/product/ProductReviews";
import { ProductVideoShowcase } from "@/components/product/ProductVideoShowcase";
import { SectionHeading } from "@/components/ui/Section";
import { videosForHandle } from "@/content/product-videos";
import ProductSchema from "@/components/ProductSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { bracelet as braceletCopy } from "@/content/product-bracelet";
import {
  buildBracelet,
  buildRing,
  closeGeneric,
  pitchFor,
} from "@/content/pitches";
import { reviewSetForHandle } from "@/data/reviews";
import { getProductByHandle, products } from "@/lib/product";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
import { getProduct } from "@/lib/shopify";
import { getPaymentMethods } from "@/lib/shopify/payments";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }
  const path = pathForHandle(product.handle);
  // Shopify's own search-listing title/description win when the merchant has
  // set them; otherwise the product title and a line built from its subtitle.
  const title = product.seoTitle ?? product.title;
  const description =
    product.seoDescription ??
    `${product.subtitle}. ${site.promise.shipping}. ${site.promise.returns}.`;
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
}

/**
 * The product detail page — the only page on the site with a buy button.
 * One sticky two-column split: gallery on the left, everything a shopper
 * needs to decide and buy on the right (title, price, pack picker, "Add to
 * bag"), specs and reviews underneath.
 *
 * The flagship product (Hematite Men's Bracelet) additionally mounts a
 * full marketing stack below the buy box — BraceletStory (dark heritage
 * band), BraceletMoments (benefit moments), BraceletVersus (genuine vs
 * lookalikes) and BraceletClose (risk-reversal CTA) — plus a
 * verified-reviews landing space. Every other listing keeps the plain
 * purchase + spec layout. Content for all of it lives in
 * content/product-bracelet.ts, not in the components.
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

  // Flagship product — the Hematite Men's Bracelet — additionally keeps its
  // comparison section (Versus), its bespoke pitch and its full review
  // dataset. Every other piece gets the same playbook from a per-product
  // pitch in content/pitches.ts so no page is a copy-paste of another.
  const isBracelet = liveProduct.handle === braceletCopy.handle;
  const pitch = pitchFor(liveProduct.handle);
  const story = pitch?.story;
  const moments = pitch?.moments;

  // Only the bracelet has a review dataset (data/reviews.ts). Null for every
  // other handle — the scope guard in reviewSetForHandle enforces that.
  const reviewSet = reviewSetForHandle(liveProduct.handle);

  // The marketing stack below the buy box (hematite story, build, QC
  // checks, versus) and the jewelry-only buy-box extras are written for the
  // hematite pieces. A product with no pitch of its own (the arm trainer,
  // and anything that follows) gets the generic sections only — specs and
  // features from Shopify, then reviews — instead of bracelet copy.
  const isJewelry = isBracelet || Boolean(pitch);

  // "What customers say": the newest 5★ reviews of this product's own
  // dataset. Empty (strip hidden) for any product without one — never
  // borrowed from another listing.
  const feedback = (reviewSet?.reviews ?? [])
    .filter((r) => r.rating === 5)
    .slice(0, 5);

  const videos = videosForHandle(liveProduct.handle);

  // What the rating line above the title prints. The merchant's
  // custom.rating_count metafield wins over the review dataset's own total
  // (e.g. reviews gathered across channels); the average comes from
  // custom.rating_average when set, otherwise from the dataset. A rating from
  // the metafields alone has no reviews section to link to.
  const rating =
    liveProduct.ratingCount != null
      ? {
          count: liveProduct.ratingCount,
          average:
            liveProduct.ratingAverage ?? reviewSet?.summary.average ?? 0,
        }
      : reviewSet?.summary;

  // The payment logos checkout actually accepts (Shopify's own settings).
  const payments = await getPaymentMethods();

  return (
    <main>
      <ProductSchema product={liveProduct} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: liveProduct.title, path: `/products/${liveProduct.handle}` },
        ]}
      />

      {/* Offer countdown: a real, merchant-set deadline (custom.sale_ends_at), shown first — as on the reference. */}
      {liveProduct.saleEndsAt && (
        <SaleCountdown endsAt={liveProduct.saleEndsAt} variant="bar" />
      )}

      <ProductPurchase
        product={liveProduct}
        rating={rating}
        ratingLinksToReviews={Boolean(reviewSet) || isJewelry}
        bestSeller={isBracelet}
        jewelry={isJewelry}
        feedback={feedback}
        payments={payments}
      />

      {/* Section 2 — the video rail. Clips live in public/videos and are
          listed per product in content/product-videos.ts; no clips, no
          section. */}
      {videos.length > 0 && (
        <section
          aria-labelledby="product-videos"
          className="overflow-hidden bg-canvas py-16 lg:py-24"
        >
          <div className="mx-auto w-full max-w-310 px-5 sm:px-8">
            <SectionHeading
              eyebrow="Real use"
              title={<span id="product-videos">See it in action.</span>}
              body="Watch the arm trainer in use."
              align="center"
            />
          </div>
          <ProductVideoShowcase
            videos={videos}
            className="mt-10 px-2 sm:px-3"
          />
        </section>
      )}

      {isJewelry && <BraceletStory story={story} />}
      {isJewelry && <BraceletMoments moments={moments} />}

      <ProductDetails product={liveProduct} />

      {/* The build — how the piece is actually made. Bracelets explain the
          elastic core that connects the stones; rings explain the solid
          band. Header "The build" link scrolls here (#build). */}
      {isJewelry && (
        <BuildSection
          content={pitch?.kind === "ring" ? buildRing : buildBracelet}
        />
      )}

      {/* Every jewelry piece carries the QC band — the buy-box "checks
          passed" link scrolls here (#quality-test). */}
      {isJewelry && <QualityTests product={liveProduct} />}

      {isBracelet && <BraceletVersus />}

      {/* Risk-reversal close — flagship keeps its own copy, every other
          piece uses the shared version. */}
      {isJewelry && (
        <BraceletClose content={isBracelet ? undefined : closeGeneric} />
      )}

      {/* Reviews: the bracelet gets the full customer-reviews feed (its own
          dataset); every other product shows the verified-only landing state
          until it has a real dataset of its own. */}
      {reviewSet ? (
        <ProductReviews
          reviews={reviewSet.reviews}
          summary={reviewSet.summary}
        />
      ) : (
        isJewelry && <ReviewsComing />
      )}
    </main>
  );
}
