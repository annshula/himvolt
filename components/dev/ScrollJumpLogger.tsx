"use client";

import { useEffect } from "react";

/**
 * TEMPORARY, development only (renders nothing in production builds).
 *
 * Finds what scrolls the PDP to the bottom at random: it wraps every call that
 * can move the page (scrollTo / scrollBy / scrollIntoView / focus) and warns in
 * the console when the page jumps a long way with no wheel, touch, key or click
 * from the visitor just before — printing the last such call's stack, the
 * focused element, and the URL hash. Delete this file and its one line in
 * app/layout.tsx once the cause is found.
 */
export function ScrollJumpLogger() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let lastY = window.scrollY;
    let lastInput = 0;
    let lastCall: { kind: string; stack: string; at: number } | null = null;

    const markInput = () => {
      lastInput = performance.now();
    };
    const inputEvents = ["wheel", "touchstart", "touchmove", "keydown", "mousedown"];
    for (const e of inputEvents) {
      window.addEventListener(e, markInput, { passive: true, capture: true });
    }

    const record = (kind: string) => {
      lastCall = {
        kind,
        stack: new Error().stack?.split("\n").slice(2, 9).join("\n") ?? "",
        at: performance.now(),
      };
    };

    type Fn = (...args: unknown[]) => unknown;
    const patches: Array<() => void> = [];
    const wrap = (target: object, name: string, kind: string) => {
      const original = (target as Record<string, Fn>)[name];
      if (typeof original !== "function") return;
      (target as Record<string, Fn>)[name] = function (this: unknown, ...args: unknown[]) {
        record(kind);
        return original.apply(this, args);
      };
      patches.push(() => {
        (target as Record<string, Fn>)[name] = original;
      });
    };
    wrap(window, "scrollTo", "window.scrollTo");
    wrap(window, "scrollBy", "window.scrollBy");
    wrap(Element.prototype, "scrollIntoView", "scrollIntoView");
    wrap(HTMLElement.prototype, "focus", "focus");

    const onScroll = () => {
      const y = window.scrollY;
      const jump = y - lastY;
      lastY = y;
      if (Math.abs(jump) < 800) return;
      if (performance.now() - lastInput < 400) return;
      const active = document.activeElement;
      console.warn("[scroll-jump]", {
        from: y - jump,
        to: y,
        pageHeight: document.documentElement.scrollHeight,
        hash: location.hash || null,
        activeElement: active
          ? `${active.tagName.toLowerCase()}#${active.id}.${String(active.className).slice(0, 80)}`
          : null,
        lastScrollingCall: lastCall
          ? { kind: lastCall.kind, msBefore: Math.round(performance.now() - lastCall.at), stack: lastCall.stack }
          : "none recorded (browser scroll restoration, anchoring or snap)",
        navType: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type,
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      for (const e of inputEvents) {
        window.removeEventListener(e, markInput, { capture: true });
      }
      for (const undo of patches) undo();
    };
  }, []);

  return null;
}
