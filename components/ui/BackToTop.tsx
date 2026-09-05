"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { easeOut } from "@/components/ui/Motion";

/** Distance from the top before the button appears. */
const SHOW_AFTER = 480;

/**
 * Back-to-top button, fixed to the bottom-right on every viewport. Appears
 * only after you scroll down, floats in with a smooth rise/fade, respects
 * reduced-motion, and clears the mobile safe-area notch on notched phones.
 * Kept at a lower z-index than the nav/drawers so it never fights a modal.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () =>
    window.scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth",
    });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={goTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 18, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.85 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 grid size-11 place-items-center rounded-full border border-white/10 bg-ink/90 text-white shadow-(--shadow-lift) backdrop-blur-md transition-colors duration-300 hover:bg-volt hover:text-on-accent active:scale-95 sm:right-6 sm:bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:size-12"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="size-4.5 sm:size-5"
          >
            <path
              d="M5 14.5 12 7.5l7 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
