"use client";

import { useEffect, useState } from "react";

/**
 * Lets a section deep in the tree (e.g. ProductSpecShowcase) tell Nav to go
 * transparent-over-dark while it's on screen, the same way `isDarkThroughout`
 * does for the whole /benefits page — except here it's just one region of an
 * otherwise light page, so it has to track scroll position, not just route.
 * A window event, not a React context, because Nav is a layout-level
 * component with no shared ancestor with the page content worth threading a
 * provider through just for this.
 */

const EVENT = "hv:nav-dark";

export function setNavDark(dark: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: dark }));
}

/** True while any component on the page has last reported itself as the dark region in view. */
export function useNavDarkOverride(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onEvent = (e: Event) => setDark((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, onEvent);
    return () => window.removeEventListener(EVENT, onEvent);
  }, []);

  return dark;
}

/**
 * Reports `dark` while `ref`'s element is anywhere in the viewport, and
 * always reports `false` on unmount so navigating away can't strand the nav
 * in the transparent state.
 */
export function useReportNavDark(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavDark(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setNavDark(false);
    };
  }, [ref]);
}
