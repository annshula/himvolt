"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import { easeOut } from "@/components/ui/Motion";
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
        preload="auto"
        poster="/poster/hero"
      >
        <source media="(max-width: 640px)" src="/videos/himvolt-hero-sm.mp4" type="video/mp4" />
        <source src="/videos/himvolt-hero.mp4" type="video/mp4" />
      </motion.video>

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
          {/*
            h1 and the subhead below render as plain elements, not
            motion.* with variants={item} — they are the LCP candidate, and
            an opacity:0 → 1 entrance driven by Framer Motion means the
            browser can't count them as "rendered" until JS hydrates *and*
            the stagger/transition timeline finishes (~1s of animation on
            top of hydration cost). That showed up as ~2.7s of LCP render
            delay with resource loading already done. Motion stays on the
            buttons/promise-line below, which aren't LCP-critical.
          */}
          <h1 className="font-mega text-[clamp(2.2rem,5.4vw,4rem)] leading-[0.95] text-chalk">
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
          </h1>

          <p className="mx-auto mt-7 max-w-[46ch] text-[1.02rem] leading-[1.65] text-steel text-pretty">
            {hero.sub}
          </p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button href={hero.ctaHref} arrow variant="invert">
              {hero.cta}
            </Button>
            <Button href={hero.secondaryHref} variant="ghost">
              {hero.secondary}
            </Button>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-8 text-[0.72rem] tracking-[0.06em] text-steel"
          >
            {site.promise.shipping} · Dispatched in 1–3 days
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
        <div
          aria-hidden
          className={`flex h-10 w-6 justify-center rounded-full border-2 border-white/50 ${reduce ? "" : "animate-bounce"}`}
        >
          <div className="mt-2 h-3 w-1 rounded-full bg-white/70" />
        </div>
        Scroll
      </motion.div>
    </section>
  );
}
