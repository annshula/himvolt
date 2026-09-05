"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "@/components/ui/Image";
import { Icon } from "@/components/ui/Icons";
import { easeOut } from "@/components/ui/Motion";
import { cn } from "@/lib/utils";
import type { StoryContent } from "@/content/pitches";

const AUTOPLAY_MS = 6000;

/**
 * Interactive "era explorer" for the dark heritage band. A story you can
 * scrub through instead of a static photo: each era of the hematite story
 * gets its own product image + line, with a segmented control, prev/next,
 * and gentle auto-advance that pauses on hover/focus. Pure client component
 * so the rest of the band stays server-rendered.
 */
export function EraExplorer({
  eras,
  images,
}: {
  eras: StoryContent["eras"];
  images: { src: string; alt: string }[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = eras.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  const era = eras[index];
  const img = images[index % images.length];

  return (
    <div
      className="overflow-hidden rounded-(--radius-card) ring-1 ring-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* ---- visual ---- */}
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* count chip */}
        <span className="absolute top-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[0.66rem] tracking-[0.18em] text-white/90 backdrop-blur-sm tabular-nums">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>

        {/* bottom gradient + era title */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/95 via-ink/55 to-transparent px-5 pt-16 pb-4">
          <motion.p
            key={`title-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="font-display text-[1.4rem] leading-tight font-semibold tracking-[-0.01em] text-white"
          >
            {era.title}
          </motion.p>
        </div>
      </div>

      {/* ---- body + controls ---- */}
      <div className="border-t border-white/10 bg-white/3 p-5">
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            key={`body-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="min-h-16 text-[0.88rem] leading-[1.65] text-white/70 text-pretty"
          >
            {era.body}
          </motion.p>
        </AnimatePresence>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((index - 1 + count) % count)}
            aria-label="Previous chapter"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition-colors duration-200 hover:border-volt/50 hover:text-volt"
          >
            <Icon name="chevron-left" className="size-4" />
          </button>

          <div className="flex flex-1 items-center gap-1.5">
            {eras.map((e, i) => (
              <button
                key={e.title}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show chapter ${i + 1}, ${e.title}`}
                aria-pressed={i === index}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500 ease-(--ease-out-expo)",
                  i === index ? "bg-volt" : "bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIndex((index + 1) % count)}
            aria-label="Next chapter"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition-colors duration-200 hover:border-volt/50 hover:text-volt"
          >
            <Icon name="chevron-right" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
