"use client";

import { useEffect } from "react";

/**
 * One observer for the whole document. Server components opt in by adding a
 * `data-reveal` attribute — no wrapper component, no per-element JS, and the
 * transition itself runs entirely in CSS on the compositor.
 *
 * Mounted once in the root layout. Ships well under 1KB.
 */
export default function RevealRoot() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      nodes.forEach((n) => (n.dataset.reveal = "in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "in";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return null;
}
