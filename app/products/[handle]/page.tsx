import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyBox } from "@/components/product/BuyBox";
import Reviews from "@/components/sections/Reviews";
import ProductSchema from "@/components/ProductSchema";
import Tilt from "@/components/ui/Tilt";
import { Reveal } from "@/components/ui/Motion";
import { product } from "@/lib/product";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
import { getProduct } from "@/lib/shopify";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ handle: product.handle }];
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  return params.then(({ handle }) => {
    if (handle !== product.handle) {
      return { title: "Product not found", robots: { index: false, follow: false } };
    }

    const title = product.title;
    const description = `${product.subtitle}. ${site.promise.shipping}. ${site.promise.returns}.`;
    const cover = product.gallery[0];

    return {
      title,
      description,
      alternates: { canonical: `/products/${product.handle}` },
      openGraph: {
        type: "website",
        title: `${title} · ${site.name}`,
        description,
        url: absoluteUrl(`/products/${product.handle}`),
        siteName: site.name,
        images: [
          {
            url: absoluteUrl(cover.src),
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
        images: [absoluteUrl(cover.src)],
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
  if (handle !== product.handle) notFound();

  // Live Shopify pricing/stock when connected; the local catalog otherwise.
  const liveProduct = await getProduct();

  const hero = product.gallery[0];
  const thumbs = product.gallery.slice(1);

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

      <div className="mx-auto grid w-full max-w-310 gap-12 px-5 pt-8 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-10 lg:pb-24">
        {/* ------------------------------ gallery ----------------------------- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Tilt className="relative mx-auto max-w-125" max={6}>
            <Image
              src={hero.src}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              priority
              sizes="(max-width: 1023px) 92vw, 42vw"
              className="w-full drop-shadow-[0_44px_56px_rgba(70,52,28,0.30)]"
            />
          </Tilt>

          {thumbs.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-125 justify-center gap-3">
              {thumbs.map((t) => (
                <div
                  key={t.src}
                  className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-line bg-parchment sm:size-18"
                >
                  <Image
                    src={t.src}
                    alt={t.alt}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------ buy box ----------------------------- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <h1 className="font-display text-[clamp(2rem,1.3rem+2.4vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink text-balance">
              {product.title}
            </h1>
            <p className="mt-2 text-[0.95rem] text-ink-soft">{product.subtitle}</p>
          </Reveal>

          <Reveal delay={0.08} className="mt-7">
            <BuyBox product={liveProduct} />
          </Reveal>

          <Reveal delay={0.14}>
            <div
              className="mt-8 max-w-[52ch] text-[0.9rem] leading-[1.65] text-ink-soft [&_p]:mt-3 [&_p:first-child]:mt-0"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />

            <dl className="mt-6 divide-y divide-line border-y border-line">
              {product.specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-6 py-3"
                >
                  <dt className="shrink-0 text-[0.78rem] text-ink-mute">
                    {s.label}
                  </dt>
                  <dd className="text-right text-[0.82rem] font-medium text-ink-soft">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <Reviews />
    </main>
  );
}
