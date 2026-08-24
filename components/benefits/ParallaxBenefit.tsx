"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type VideoSource = { src: string; type: string; media?: string };

type Media =
  | { kind: "video"; sources: VideoSource[]; poster: string }
  | { kind: "image"; src: string; alt: string };

/**
 * One full-screen scroll moment: a video or photo drifting behind fixed
 * copy, the parallax driven by the section's own scroll progress (same
 * primitive as the home hero) rather than a scroll-timeline CSS trick, so it
 * degrades cleanly under prefers-reduced-motion. The copy also cross-fades
 * against that same progress, so leaving one section and arriving at the
 * next reads as a dissolve rather than a hard cut.
 */
export function ParallaxBenefit({
  index,
  eyebrow,
  title,
  body,
  media,
  align = "left",
  zoom = 1,
}: {
  index: string;
  eyebrow: string;
  title: string;
  body?: string;
  media: Media;
  align?: "left" | "right";
  /** How much the background media scales in/out as you scroll through the section, from 0 (steady, no zoom) to 1 (the full 1.16 peak). */
  zoom?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-14%", "14%"]);
  const scalePeak = 1 + 0.16 * zoom;
  const scaleMid = 1 + 0.02 * zoom;
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [scalePeak, scaleMid, scalePeak],
  );
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    reduce ? [1, 1, 1, 1] : [0, 1, 1, 0],
  );
  const contentY = useTransform(scrollYProgress, [0, 0.2], reduce ? [0, 0] : [28, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex h-svh snap-start items-center overflow-hidden bg-pitch"
    >
      <motion.div aria-hidden style={{ y, scale }} className="absolute inset-0 -z-20">
        {media.kind === "video" ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={media.poster}
            className="h-full w-full object-cover"
          >
            {media.sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} media={s.media} />
            ))}
          </video>
        ) : (
          <Image
            src={media.src}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/30 to-black/50"
      />

      {/* Giant faint index numeral — pure typographic texture, no fill. */}
      <span
        aria-hidden
        className={cn(
          "font-mega pointer-events-none absolute top-1/2 -z-10 -translate-y-1/2 text-[38vw] leading-none text-white/5 select-none",
          align === "right" ? "left-[-4vw]" : "right-[-4vw]",
        )}
      >
        {index}
      </span>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className={cn(
          "mx-auto flex w-full max-w-310 px-5 sm:px-8",
          align === "right" ? "justify-end text-right" : "justify-start text-left",
        )}
      >
        {/* No <Reveal> here on purpose: it whileInView-fades once via its own
            IntersectionObserver, which can miss its window entirely on a
            fast scroll past a deep section and freeze this text at opacity
            0 forever after — the parent motion.div's scroll-linked
            contentOpacity above already fades this in/out continuously and
            correctly from actual scroll position, so a second, less
            reliable opacity source here only fights it. */}
        <div className="max-w-lg">
          <p className="font-display text-[0.72rem] font-semibold tracking-[0.32em] text-volt uppercase">
            {index} · {eyebrow}
          </p>
          <h2 className="font-display mt-5 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.03] font-extrabold tracking-[-0.03em] text-chalk text-balance">
            {title}
          </h2>
          {body && (
            <p className="mt-6 text-[1.02rem] leading-[1.7] text-steel text-pretty">
              {body}
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
