"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
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

  // Touch-swipe plumbing: track where the finger lands so a horizontal flick
  // flips chapters without fighting vertical page scroll.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // First-time "Swipe" hint for touch users — fades out on its own or the
  // moment they actually swipe.
  useEffect(() => {
    if (!showSwipeHint) return;
    const t = setTimeout(() => setShowSwipeHint(false), 4000);
    return () => clearTimeout(t);
  }, [showSwipeHint]);

  const goTo = (nextIdx: number) =>
    setIndex(((nextIdx % count) + count) % count);

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
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (!t) return;
        touchStart.current = { x: t.clientX, y: t.clientY };
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const s = touchStart.current;
        touchStart.current = null;
        const t = e.changedTouches[0];
        if (!s || !t) {
          setPaused(false);
          return;
        }
        const dx = t.clientX - s.x;
        const dy = t.clientY - s.y;
        if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy)) {
          setShowSwipeHint(false);
          goTo(index + (dx < 0 ? 1 : -1));
          setPaused(false);
        } else {
          setPaused(false);
        }
      }}
      onTouchCancel={() => {
        touchStart.current = null;
        setPaused(false);
      }}
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
            {/* Pre-optimised AVIF + WebP fallback (≤1200px) shipped from
                /public. A plain <picture> (not next/image) so it never
                routes through Vercel's paid /_next/image optimizer, same
                reasoning as the review photos in ProductReviews.tsx — and
                gets AVIF's real size win where next/image's `unoptimized`
                flag alone couldn't (that only ever serves the one format
                you give it). Every /story/*.webp ships with a same-named
                .avif sibling. */}
            <picture>
              <source
                srcSet={era.image.src.replace(/\.webp$/, ".avif")}
                type="image/avif"
              />
              <source srcSet={era.image.src} type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={era.image.src}
                alt={era.image.alt}
                loading="lazy"
                className="skeleton absolute inset-0 h-full w-full object-cover"
              />
            </picture>
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
            className="size-5 text-white opacity-60 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90 md:opacity-0"
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
            className="size-5 text-white opacity-60 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90 md:opacity-0"
          />
        </button>

        {showSwipeHint && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-[0.66rem] font-medium tracking-wide text-white/90 backdrop-blur-sm md:hidden"
          >
            <Icon name="chevron-left" className="size-3.5" />
            Swipe
            <Icon name="chevron-right" className="size-3.5" />
          </span>
        )}
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
