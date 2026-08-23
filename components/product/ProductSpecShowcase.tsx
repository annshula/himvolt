"use client";

import { useRef } from "react";

import { ParallaxBenefit } from "@/components/benefits/ParallaxBenefit";
import { useReportNavDark } from "@/lib/nav-theme";
import type { Product } from "@/lib/product";

/**
 * Every spec (Stone, Cut, Hardness, ...) gets the /benefits page's full-
 * height parallax treatment instead of a small label/value list — the
 * product's own gallery photos as the backdrop, cycled and alternating left/
 * right the same way ParallaxBenefit already does for the /benefits page.
 * No ScrollSnapRoot here on purpose: that page is a dedicated, all-dark
 * scroll experience, this is one section inside a normal product page, so
 * the sections scroll like any other section instead of snapping. Nav does
 * switch to /benefits' transparent treatment while this region is on
 * screen, though — see useReportNavDark.
 */
export function ProductSpecShowcase({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  useReportNavDark(ref);

  if (product.specs.length === 0) return null;

  return (
    <section ref={ref} aria-label={`${product.title} specification`}>
      {product.specs.map((spec, i) => {
        const image = product.gallery[i % product.gallery.length];
        return (
          <ParallaxBenefit
            key={spec.label}
            index={String(i + 1).padStart(2, "0")}
            eyebrow={spec.label}
            title={spec.value}
            media={{ kind: "image", src: image.src, alt: image.alt }}
            align={i % 2 === 0 ? "left" : "right"}
          />
        );
      })}
    </section>
  );
}
