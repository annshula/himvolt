"use client";

import { useRef } from "react";

import { ParallaxBenefit } from "@/components/benefits/ParallaxBenefit";
import { useReportNavDark } from "@/lib/nav-theme";
import type { Product } from "@/lib/product";

/**
 * The /benefits page's full-height parallax treatment, applied to a single
 * product: its Shopify-editable feature highlights first (custom.
 * feature_highlights — see lib/shopify/sync-product.ts), then its specs,
 * as one continuous sequence of full-screen sections sharing the product's
 * own gallery photos as backdrops. One ref/useReportNavDark for the whole
 * run rather than one per group — features and specs sit back to back with
 * nothing light between them, and separate observers on adjacent sections
 * risk a flicker back to the light nav in the gap between one exiting and
 * the next entering.
 *
 * No ScrollSnapRoot on purpose: that's a dedicated, all-dark page; this is
 * one region of an otherwise light product page, so it scrolls normally.
 */
export function ProductShowcase({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  useReportNavDark(ref);

  const entries = [
    ...product.features
      // Shipping isn't a property of the product — it's already covered in
      // BuyBox's Guarantees list, so a "ship" entry here would just repeat
      // it in a section otherwise dedicated to what the piece itself is.
      .filter((f) => f.icon !== "ship")
      .map((f) => ({
        eyebrow: "Feature",
        title: f.label,
        body: f.body,
        image: f.image,
        video: f.video,
      })),
    ...product.specs.map((s) => ({
      eyebrow: s.label,
      title: s.value,
      body: s.description,
      image: s.image,
      video: s.video,
    })),
  ];

  if (entries.length === 0) return null;

  return (
    <section ref={ref} aria-label={`${product.title} highlights and specification`}>
      {entries.map((entry, i) => {
        // A merchant-picked image (Shopify Admin > Metaobjects) if this
        // entry has one; otherwise cycle through the product's own gallery
        // rather than show nothing. A video, when present, replaces the
        // image entirely rather than playing alongside it.
        const image = entry.image ?? product.gallery[i % product.gallery.length];
        const media = entry.video
          ? ({ kind: "video", poster: entry.video.poster, sources: entry.video.sources } as const)
          : ({ kind: "image", src: image.src, alt: image.alt } as const);
        return (
          <ParallaxBenefit
            key={`${entry.eyebrow}-${entry.title}`}
            index={String(i + 1).padStart(2, "0")}
            eyebrow={entry.eyebrow}
            title={entry.title}
            body={entry.body}
            media={media}
            align={i % 2 === 0 ? "left" : "right"}
            zoom={0.25}
          />
        );
      })}
    </section>
  );
}
