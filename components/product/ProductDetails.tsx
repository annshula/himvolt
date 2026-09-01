"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { CatalogImage, CatalogVideo, Product } from "@/lib/product";

type Entry = {
  key: string;
  eyebrow: string;
  title: string;
  description?: string;
  image?: CatalogImage | null;
  video?: CatalogVideo | null;
};

/**
 * Feature highlights and specs as one continuous full-height rhythm: image
 * and text split left/right, swapping sides every row so the page has a
 * back-and-forth motion as you scroll. Both used to be two visually
 * different sections (a dark cinematic reel for features, a light split for
 * specs) — merged here so the whole run reads as one consistent design
 * instead of a jarring handoff partway through.
 *
 * Stays in the site's normal light theme throughout (no dark takeover, no
 * nav override) — the split and the alternating sides are what make it feel
 * different from /benefits, not a change of palette.
 *
 * Uses each row's own scroll progress for the motion (same primitive as
 * ParallaxBenefit) rather than a whileInView `Reveal` — a `Reveal` fades in
 * once via its own IntersectionObserver and can miss its window entirely on
 * a fast scroll past a deep section, freezing the text at opacity 0
 * forever after (the exact bug fixed on ParallaxBenefit earlier). A
 * continuous scroll-linked transform can't get stuck that way.
 */
export function ProductDetails({ product }: { product: Product }) {
  const entries: Entry[] = [
    ...product.features
      // Shipping isn't a property of the product — it's already covered in
      // BuyBox's Guarantees list, so a "ship" entry here would just repeat
      // it in a section otherwise dedicated to what the piece itself is.
      .filter((f) => f.icon !== "ship")
      .map((f) => ({
        key: `feature-${f.label}`,
        eyebrow: "Feature",
        title: f.label,
        description: f.body,
        image: f.image,
        video: f.video,
      })),
    ...product.specs.map((s) => ({
      key: `spec-${s.label}`,
      eyebrow: s.label,
      title: s.value,
      description: s.description,
      image: s.image,
      video: s.video,
    })),
  ];

  if (entries.length === 0) return null;

  return (
    <section aria-label={`${product.title} highlights and specification`}>
      <div className="mx-auto w-full max-w-310 px-5 pt-24 sm:px-8 lg:pt-32">
        <SectionHeading
          eyebrow="Specification"
          title="Every detail, verified."
          body="What the piece is actually made of, measured and described plainly — not marketing copy standing in for a spec sheet."
        />
      </div>

      {entries.map((entry, i) => (
        <DetailRow
          key={entry.key}
          index={String(i + 1).padStart(2, "0")}
          entry={entry}
          fallback={product.gallery[i % product.gallery.length]}
          imageOnRight={i % 2 === 1}
        />
      ))}
    </section>
  );
}

function DetailRow({
  index,
  entry,
  fallback,
  imageOnRight,
}: {
  index: string;
  entry: Entry;
  fallback: CatalogImage;
  imageOnRight: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["-8%", "8%"],
  );
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [0.94, 1, 0.94],
  );
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.78, 1],
    reduce ? [1, 1, 1, 1] : [0, 1, 1, 0],
  );
  const textY = useTransform(
    scrollYProgress,
    [0, 0.22],
    reduce ? [0, 0] : [26, 0],
  );

  const image = entry.image ?? fallback;

  return (
    <section
      ref={ref}
      className="flex h-svh items-center bg-canvas px-5 sm:px-8"
    >
      <div className="mx-auto grid min-w-0 w-full max-w-310 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          style={{ y: mediaY, scale: mediaScale }}
          className={cn(
            // aspect-square + w-full (capped by max-w-*) lets the tile shrink on
            // narrow screens instead of overflowing the grid cell.
            "relative mx-auto aspect-square w-full max-w-80 overflow-hidden rounded-(--radius-card) border border-line sm:max-w-96 lg:max-w-110",
            imageOnRight ? "order-1 lg:order-2" : "order-1 lg:order-1",
          )}
        >
          {entry.video ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={entry.video.poster}
              className="h-full w-full object-cover"
            >
              {entry.video.sources.map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))}
            </video>
          ) : (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 639px) 320px, (max-width: 1023px) 384px, 440px"
              className="object-cover"
            />
          )}
        </motion.div>

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className={cn(
            // min-w-0 lets the text column shrink with the grid on small screens.
            "order-2 min-w-0 max-w-lg",
            imageOnRight ? "lg:order-1" : "lg:order-2",
          )}
        >
          <p className="font-display text-[0.72rem] font-semibold tracking-[0.32em] text-volt uppercase">
            {index} · {entry.eyebrow}
          </p>
          <h3 className="font-display mt-5 text-[clamp(1.8rem,1.3rem+2.2vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-ink text-balance">
            {entry.title}
          </h3>
          {entry.description && (
            <p className="mt-6 text-[1rem] leading-[1.7] text-ink-soft text-pretty">
              {entry.description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
