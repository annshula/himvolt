"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import Image from "@/components/ui/Image";
import { Icon } from "@/components/ui/Icons";
import { easeOut } from "@/components/ui/Motion";
import type { StoryContent } from "@/content/pitches";

const AUTOPLAY_MS = 6000;

/**
 * Interactive "era explorer" for the dark heritage band. A story you can
 * scrub through instead of a static photo: each era of the hematite story
 * carries its own purpose-made image (content/pitches.ts) + line. Minimal
 * chrome on purpose — thin
 * Stories-style progress bars double as the only navigation (plus invisible
 * tap zones on the image), the photo runs clean with no overlay, and the
 * copy lives in open space underneath. Gentle auto-advance pauses on
 * hover/focus. Pure client component so the rest of the band stays
 * server-rendered.
 */
export function EraExplorer({ eras }: { eras: StoryContent["eras"] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = eras.length;
  const progress = useAnimationControls();

  useEffect(() => {
    if (count < 2) return;
    if (paused) {
      progress.stop();
      return;
    }
    progress.set({ scaleX: 0 });
    progress.start({
      scaleX: 1,
      transition: { duration: AUTOPLAY_MS / 1000, ease: "linear" },
    });
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, count, progress]);

  const era = eras[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* ---- progress / chapter select ---- */}
      <div role="tablist" aria-label="Chapters" className="flex gap-2">
        {eras.map((e, i) => (
          <button
            key={e.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show chapter ${i + 1}, ${e.title}`}
            onClick={() => setIndex(i)}
            className="relative h-px flex-1 overflow-hidden rounded-full bg-white/15"
          >
            {i < index && <span className="absolute inset-0 bg-volt" />}
            {i === index && (
              <motion.span
                className="absolute inset-y-0 left-0 bg-volt"
                style={{ transformOrigin: "0% 50%" }}
                initial={{ scaleX: 0 }}
                animate={progress}
              />
            )}
          </button>
        ))}
      </div>

      {/* ---- visual ---- */}
      <div className="relative mt-5 aspect-4/3 w-full overflow-hidden rounded-sm">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            {/* Pre-optimised WebP (≤1200px) shipped from /public — served
                directly via `unoptimized` so it never routes through
                Vercel's paid /_next/image optimizer, same as the review
                photos in ProductReviews.tsx. */}
            <Image
              src={era.image.src}
              alt={era.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              unoptimized
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIndex((index - 1 + count) % count)}
          aria-label="Previous chapter"
          className="group absolute inset-y-0 left-0 flex w-1/3 items-center justify-start pl-4 focus-visible:outline-none"
        >
          <Icon
            name="chevron-left"
            className="size-5 text-white opacity-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90"
          />
        </button>
        <button
          type="button"
          onClick={() => setIndex((index + 1) % count)}
          aria-label="Next chapter"
          className="group absolute inset-y-0 right-0 flex w-1/3 items-center justify-end pr-4 focus-visible:outline-none"
        >
          <Icon
            name="chevron-right"
            className="size-5 text-white opacity-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90"
          />
        </button>
      </div>

      {/* ---- copy, in open space, no card ---- */}
      <div className="mt-6 flex gap-4">
        <span className="font-mono text-[0.7rem] tracking-[0.2em] text-volt tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <p className="font-display text-[1.15rem] leading-tight font-semibold tracking-[-0.01em] text-white">
              {era.title}
            </p>
            <p className="mt-2.5 text-[0.88rem] leading-[1.65] text-white/60 text-pretty">
              {era.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
