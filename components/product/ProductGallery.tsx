"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import Tilt from "@/components/ui/Tilt";
import { Icon } from "@/components/ui/Icons";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/product";

const LG_QUERY = "(min-width: 1024px)";

/** True at the `lg` breakpoint — the thumbnail rail flips to a vertical column. */
function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(LG_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(LG_QUERY).matches,
    () => false,
  );
}

/**
 * Amazon-style product gallery: a compact, independently-scrollable
 * thumbnail rail (left of the main image on desktop, a horizontal strip
 * above it on mobile) switches the main image on click, and clicking the
 * main image opens a full-screen lightbox with prev/next and click-to-zoom.
 * No external lightbox library — same plain-CSS-transition modal pattern as
 * CartDrawer, portaled to document.body so it can never get trapped inside
 * a transformed ancestor's stacking context (the Tilt wrapper below sets a
 * CSS `transform`, which would otherwise scope a `position: fixed`
 * descendant to itself instead of the viewport).
 *
 * `activeSrc` — the currently selected variant's image, from BuyBox — jumps
 * the main preview to match it without taking over manual thumbnail
 * browsing: only re-syncs when `activeSrc` itself changes.
 */
export function ProductGallery({
  product,
  activeSrc,
}: {
  product: Product;
  activeSrc?: string;
}) {
  const gallery = product.gallery;
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!activeSrc) return;
    const i = gallery.findIndex((img) => img.src === activeSrc);
    if (i !== -1) setIndex(i);
  }, [activeSrc, gallery]);

  const active = gallery[index] ?? gallery[0];

  return (
    // min-w-0: this div is a grid item in ProductPurchase, and grid items
    // default to min-width:auto — without it the Embla slide row would keep
    // the grid cell (and page) from shrinking below its full content width.
    <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <div className="flex flex-col-reverse gap-4 lg:flex-row">
        {gallery.length > 1 && (
          <Carousel
            orientation={isDesktop ? "vertical" : "horizontal"}
            // align start + trimSnaps snaps each thumbnail into view on drag;
            // no dragFree — it collapses Embla's snap list so the arrow
            // disabled-state (canScrollNext) never enables.
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className="w-full min-w-0 lg:w-19 lg:shrink-0"
          >
            {/* p-1 keeps the active thumb's ring/offset inside the overflow-hidden
                viewport instead of clipping it at the strip's edges. */}
            <CarouselContent
              viewportClassName="lg:max-h-115"
              className="gap-2.5 p-1 lg:flex-col lg:py-1.5"
            >
              {gallery.map((img, i) => (
                <CarouselItem key={img.src} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`Show image ${i + 1} of ${gallery.length}`}
                    aria-pressed={i === index}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative size-14 overflow-hidden rounded-lg border border-line transition-all duration-300 sm:size-16",
                      i === index
                        ? "ring-2 ring-ink ring-offset-2"
                        : "hover:ring-1 hover:ring-ink/40 hover:ring-offset-1",
                    )}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open full-size image"
          className="group relative mx-auto block w-full max-w-115 cursor-zoom-in"
        >
          <Tilt className="relative" max={6}>
            <Image
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              priority={index === 0}
              sizes="(max-width: 1023px) 92vw, 40vw"
              className="w-full"
            />
          </Tilt>
          <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-(--shadow-e2) transition-opacity duration-300 group-hover:opacity-100">
            <Icon name="zoom" className="size-4" />
          </span>
        </button>
      </div>

      <Lightbox
        gallery={gallery}
        index={index}
        onIndexChange={setIndex}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function Lightbox({
  gallery,
  index,
  onIndexChange,
  open,
  onClose,
}: {
  gallery: Product["gallery"];
  index: number;
  onIndexChange: (i: number) => void;
  open: boolean;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);
  useScrollLock(open);

  useEffect(() => setMounted(true), []);

  // Swipe left/right to move between images — a plain touch delta, not a
  // gesture library: this is the only gesture the viewer needs. Ignored
  // while zoomed in, where a horizontal drag more likely means "let me pan
  // this", and ignored when the gesture reads as more vertical than
  // horizontal (a scroll attempt, not a swipe).
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || zoomed || gallery.length <= 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    onIndexChange(
      dx < 0
        ? (index + 1) % gallery.length
        : (index - 1 + gallery.length) % gallery.length,
    );
  };

  useEffect(() => {
    if (!open) return;
    setZoomed(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % gallery.length);
      if (e.key === "ArrowLeft")
        onIndexChange((index - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, gallery.length, onClose, onIndexChange]);

  if (!mounted) return null;

  const active = gallery[index] ?? gallery[0];

  return createPortal(
    <div
      className={cn("fixed inset-0 z-100", !open && "pointer-events-none")}
      inert={!open}
    >
      <div
        onClick={onClose}
        // A literal colour, not a `bg-*/NN` utility — this backdrop must
        // always be opaque regardless of any Tailwind theme-token or
        // opacity-modifier quirk; it is the whole reason the lightbox
        // doesn't show the page through it.
        style={{ backgroundColor: "rgba(4,4,4,0.95)" }}
        className={cn(
          "absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        className={cn(
          "absolute inset-0 flex flex-col transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <span className="text-[0.78rem] tracking-widest text-chalk/70 tabular-nums">
            {index + 1} / {gallery.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="grid size-10 place-items-center rounded-full border border-white/20 text-chalk transition-colors duration-300 hover:border-white/50"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>

        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {gallery.length > 1 && (
            <button
              type="button"
              onClick={() =>
                onIndexChange((index - 1 + gallery.length) % gallery.length)
              }
              aria-label="Previous image"
              className="absolute left-2 z-10 grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-chalk transition-colors duration-300 hover:bg-white/20 sm:left-6"
            >
              <Icon name="chevron-right" className="size-5 rotate-180" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className={cn(
              "relative max-h-full max-w-full overflow-hidden",
              zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
            )}
          >
            <Image
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              sizes="90vw"
              className={cn(
                "max-h-[78vh] w-auto object-contain transition-transform duration-500 ease-(--ease-out-expo)",
                zoomed ? "scale-[1.8]" : "scale-100",
              )}
            />
          </button>

          {gallery.length > 1 && (
            <button
              type="button"
              onClick={() => onIndexChange((index + 1) % gallery.length)}
              aria-label="Next image"
              className="absolute right-2 z-10 grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-chalk transition-colors duration-300 hover:bg-white/20 sm:right-6"
            >
              <Icon name="chevron-right" className="size-5" />
            </button>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex justify-center gap-2.5 px-5 pb-6">
            {gallery.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => onIndexChange(i)}
                className={cn(
                  "relative size-12 shrink-0 overflow-hidden rounded-md border border-white/15 transition-all duration-300",
                  i === index
                    ? "ring-2 ring-white ring-offset-2 ring-offset-void"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
