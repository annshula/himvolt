"use client";

import { useEffect } from "react";

/**
 * Scopes CSS scroll-snap to the document while this page is mounted, rather
 * than putting it in globals.css where it would grab every page's scroll.
 * `proximity`, not `mandatory` — it settles full-screen sections into place
 * when the user stops scrolling near one, without ever fighting a scroll
 * gesture or trapping the user before the footer.
 */
export function ScrollSnapRoot() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollSnapType;
    root.style.scrollSnapType = "y proximity";
    return () => {
      root.style.scrollSnapType = previous;
    };
  }, []);

  return null;
}
