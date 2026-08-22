"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import { Magnetic, easeOut } from "@/components/ui/Motion";
import { hero } from "@/content/copy";
import { site } from "@/lib/site";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="grain relative isolate -mt-[calc(var(--nav-h)+var(--marquee-h))] flex min-h-svh flex-col overflow-hidden bg-ink"
    >
      {/* --------------------------- backdrop ---------------------------- */}
      <motion.video
        aria-hidden
        style={{ y: videoY }}
        className="pointer-events-none absolute inset-0 -z-10 h-[120%] w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/himvolt-hero.mp4"
      />

      {/* Black scrim over the footage so the white type always reads clearly */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[-5]"
        style={{
          background:
            "radial-gradient(95% 80% at 50% 45%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* ----------------------------- content ---------------------------- */}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="mx-auto flex w-full max-w-310 flex-1 flex-col items-center justify-center px-5 pt-20 pb-8 sm:px-8"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-176 text-center"
        >
          <motion.p
            variants={item}
            className="mb-7 inline-flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-black/30 py-2 pr-4 pl-2.5 text-[0.63rem] font-medium tracking-[0.26em] text-chalk/90 uppercase backdrop-blur-sm"
          >
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-chalk text-chalk">
              <span className="pulse-ring absolute inset-0 rounded-full" />
            </span>
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={item}
            className="font-mega text-[clamp(2.9rem,7.2vw,5.2rem)] leading-[0.88] text-chalk"
          >
            {hero.headline[0]}
            <br />
            <span className="relative inline-block">
              {hero.headline[1]}
              {/* the single white glint in the type */}
              <motion.span
                aria-hidden
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.7 }}
                transition={{ duration: 0.9, delay: 0.9, ease: easeOut }}
                style={{ transformOrigin: "0% 50%" }}
                className="absolute -right-1 -bottom-1 h-0.75 w-[42%] rounded-full bg-linear-to-r from-transparent via-chalk/60 to-transparent"
              />
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-[46ch] text-[1.02rem] leading-[1.65] text-steel text-pretty"
          >
            {hero.sub}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Magnetic>
              <Button href={hero.ctaHref} arrow variant="invert">
                {hero.cta}
              </Button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Button href={hero.secondaryHref} variant="ghost">
                {hero.secondary}
              </Button>
            </Magnetic>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-8 text-[0.72rem] tracking-[0.06em] text-steel"
          >
            {site.promise.shipping} · {site.promise.returns} · Dispatched in 1–3 days
          </motion.p>
        </motion.div>
      </motion.div>

      {/* --------------------------- scroll cue --------------------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{ opacity: reduce ? 1 : contentOpacity }}
        className="pointer-events-none relative z-10 mx-auto mb-7 hidden items-center gap-2 text-[0.62rem] tracking-[0.22em] text-chalk/60 uppercase sm:flex"
      >
        <motion.span
          aria-hidden
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-8 w-5 items-start justify-center rounded-full border border-chalk/30 p-1"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-chalk/70" />
        </motion.span>
        Scroll
      </motion.div>
    </section>
  );
}
