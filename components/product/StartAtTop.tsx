"use client";

import { useEffect } from "react";

/**
 * Opens the product page at the top. The browser otherwise restores the last
 * scroll position on a reload or revisit, and with `scroll-behavior: smooth`
 * on <html> that restore plays as a visible glide to wherever the shopper
 * last was: often the bottom of the page. Restoration also lands late, after
 * the load event, so the top is re-asserted then too unless the shopper has
 * started scrolling. Back/forward and `#hash` links keep their position.
 */
export function StartAtTop() {
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (window.location.hash || nav?.type === "back_forward") return;

    window.history.scrollRestoration = "manual";

    let touched = false;
    const onInput = () => (touched = true);
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((e) =>
      window.addEventListener(e, onInput, { passive: true, once: true }),
    );

    const toTop = () => {
      if (!touched && window.scrollY > 0)
        window.scrollTo({ top: 0, behavior: "instant" });
    };
    toTop();
    if (document.readyState !== "complete")
      window.addEventListener("load", toTop, { once: true });

    return () => {
      inputs.forEach((e) => window.removeEventListener(e, onInput));
      window.removeEventListener("load", toTop);
    };
  }, []);

  return null;
}
