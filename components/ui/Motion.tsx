"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Transition,
  type Variants,
} from "motion/react";
import {
  useRef,
  type ElementType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/**
 * Shared motion vocabulary for the whole site. One easing curve, one set of
 * durations, so every reveal, hover and drag feels like it belongs to the
 * same object instead of ten components each inventing their own timing.
 */
export const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1];

const tags = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  ul: motion.ul,
  li: motion.li,
  article: motion.article,
  header: motion.header,
  figure: motion.figure,
} as const;

type Tag = keyof typeof tags;

/**
 * Fades + lifts a single element into view the moment it crosses the
 * viewport, once. Reduced-motion users get a plain opacity fade with no
 * displacement.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  duration = 0.7,
  amount = 0.2,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: Tag;
  duration?: number;
  amount?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const MotionTag = tags[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.2 : duration, delay: reduce ? 0 : delay, ease: easeOut }}
    >
      {children}
    </MotionTag>
  );
}

const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

/** Stagger container — pair with <StaggerItem> children. */
export function Stagger({
  children,
  className,
  as = "div",
  amount = 0.2,
  once = true,
  stagger = 0.09,
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
  amount?: number;
  once?: boolean;
  stagger?: number;
}) {
  const MotionTag = tags[as];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: 0.04 } },
      }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
  y = 22,
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
  y?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const MotionTag = tags[as];
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: easeOut } },
      }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Wraps interactive elements (buttons, icon links) so they drift toward the
 * pointer and spring back on release. Mouse only — touch devices pass through
 * untouched, and reduced-motion users get a plain wrapper.
 */
export function Magnetic({
  children,
  className,
  strength = 0.35,
  range = 60,
}: {
  children: ReactNode;
  className?: string;
  /** Fraction of pointer offset that becomes translation. */
  strength?: number;
  /** How far outside the element the pull still applies, in px. */
  range?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 20, mass: 0.4 });
  const y = useSpring(0, { stiffness: 260, damping: 20, mass: 0.4 });

  if (reduce) return <div className={className}>{children}</div>;

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const relX = e.clientX - (r.left + r.width / 2);
    const relY = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(relX, relY);
    const max = Math.max(r.width, r.height) / 2 + range;
    if (dist > max) return;
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-bound progress bar, spring-smoothed. Fixed/sticky positioning is the caller's job. */
export function ScrollProgressBar({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className={className}
    />
  );
}
