"use client";

import { useEffect, useRef } from "react";

type Ember = { x: number; y: number; vx: number; vy: number; r: number; a: number; hot: boolean };

/**
 * Ambient ember field behind the hero. Deliberately restrained: ~54 particles,
 * device pixel ratio capped at 1.5, and the loop is suspended whenever the
 * canvas scrolls out of view or the tab is hidden — so it costs nothing on the
 * rest of the page and never fights the LCP paint.
 *
 * Mounted client-side only, after the hero image, so it contributes zero bytes
 * to the critical path.
 */
export default function VoltField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let embers: Ember[] = [];

    const seed = () => {
      const count = w < 640 ? 26 : 54;
      embers = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -0.06 - Math.random() * 0.22,
        r: 0.5 + Math.random() * 1.7,
        a: 0.06 + Math.random() * 0.3,
        hot: Math.random() < 0.22,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const e of embers) {
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < -12) {
          e.y = h + 12;
          e.x = Math.random() * w;
        }
        if (e.x < -12) e.x = w + 12;
        if (e.x > w + 12) e.x = -12;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.hot
          ? `rgba(255,110,72,${e.a})`
          : `rgba(190,200,214,${e.a * 0.5})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
