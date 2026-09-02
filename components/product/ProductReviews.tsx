"use client";

import Image from "@/components/ui/Image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { SectionHeading } from "@/components/ui/Section";
import {
  CameraIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Icon,
} from "@/components/ui/Icons";
import { RatingStars, StarRow } from "@/components/ui/Stars";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import type { ProductReview, ReviewSummary } from "@/data/reviews";

/**
 * Full customer-reviews experience for the Hematite Men's Bracelet: an
 * aggregate summary (clickable star breakdown), quick filters (all / with
 * photos / by star) and a paginated, modern review feed. Customer photos
 * open in a lightbox (same portal + CSS-transition modal pattern as
 * ProductGallery). Reviews are received as a prop from the server page —
 * this component never imports the (large) dataset, so the client bundle
 * stays lean.
 *
 * Filtering + pagination are deliberately client-side: the dataset is a
 * couple of thousand small records at most, and it keeps deep-linking to
 * a specific review page snappy (no request per page).
 */

const PAGE_SIZE = 6;

type Filter = "all" | "photo" | 5 | 4 | 3 | 2 | 1;

export default function ProductReviews({
  reviews,
  summary,
}: {
  reviews: ProductReview[];
  summary: ReviewSummary;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const by: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let photos = 0;
    for (const r of reviews) {
      by[r.rating]++;
      if (r.images?.length) photos++;
    }
    return { by, photos };
  }, [reviews]);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    if (filter === "photo") return reviews.filter((r) => r.images?.length);
    return reviews.filter((r) => r.rating === filter);
  }, [reviews, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const chooseFilter = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    // Keep the review list in view when flipping pages — the scroll-mt on
    // the list wrapper clears the sticky nav.
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chips: { id: Filter; label: string; icon?: "camera"; count: number }[] =
    [
      { id: "all", label: "All reviews", count: reviews.length },
      { id: "photo", label: "", icon: "camera", count: counts.photos },
      ...([5, 4, 3, 2, 1] as const).map((stars) => ({
        id: stars as Filter,
        label: `${stars} star${stars === 1 ? "" : "s"}`,
        count: counts.by[stars],
      })),
    ];

  return (
    <section
      id="reviews"
      aria-label={`${summary.count.toLocaleString("en-US")} customer reviews`}
      className="relative scroll-mt-20 border-t border-line bg-parchment/60"
    >
      <div className="mx-auto w-full max-w-310 px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          align="center"
          eyebrow="Verified customer reviews"
          title="Bought once. Worn every day since."
          body="Every review below is from a confirmed order. Reviews with a photo show the piece as it really arrived."
        />

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-12">
          {/* ------------------------- summary / left ------------------------ */}
          <aside
            aria-label="Rating summary"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="rounded-(--radius-card) border border-line bg-ivory p-7 shadow-(--shadow-e1)">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[3.2rem] leading-none font-extrabold tracking-[-0.03em] text-ink tabular-nums">
                  {summary.average.toFixed(1)}
                </span>
                <span className="text-[0.82rem] text-ink-mute">
                  / 5 · {summary.count.toLocaleString("en-US")} reviews
                </span>
              </div>

              <RatingStars
                value={summary.average}
                className="mt-3"
                starClassName="h-4 w-4"
              />

              <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-mute">
                <span className="font-semibold text-ink">
                  {summary.recommended}% of buyers
                </span>{" "}
                would recommend this bracelet.
              </p>

              <ul className="mt-7 flex flex-col gap-1">
                {summary.distribution.map((d) => (
                  <li key={d.stars}>
                    <button
                      type="button"
                      onClick={() => chooseFilter(d.stars as Filter)}
                      aria-pressed={filter === d.stars}
                      aria-label={`Filter to ${d.stars} star reviews — ${d.count}`}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200",
                        filter === d.stars
                          ? "bg-accent-soft"
                          : "hover:bg-parchment",
                      )}
                    >
                      <StarRow stars={d.stars} starClassName="h-3 w-3" />
                      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <span
                          className={cn(
                            "block h-full rounded-full transition-all duration-300",
                            d.count > 0
                              ? "bg-linear-to-r from-volt-deep to-volt"
                              : "bg-transparent",
                          )}
                          style={{ width: `${d.percent}%` }}
                        />
                      </span>
                      <span className="w-14 text-right text-[0.7rem] text-ink-mute tabular-nums">
                        {d.count.toLocaleString("en-US")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => chooseFilter("photo")}
                aria-pressed={filter === "photo"}
                className={cn(
                  "mt-5 flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[0.8rem] transition-colors duration-200",
                  filter === "photo"
                    ? "border-volt/50 bg-accent-soft text-ink"
                    : "border-line bg-ivory text-ink-soft hover:border-line-strong",
                )}
              >
                <CameraIcon className="h-4 w-4 text-volt" />
                <span className="font-medium">
                  With photos ({summary.withPhotos})
                </span>
              </button>
            </div>
          </aside>

          {/* --------------------------- list / right ------------------------- */}
          <div ref={listRef} className="scroll-mt-28">
            {/* filter chips */}
            <div
              role="group"
              aria-label="Filter reviews"
              className="flex flex-wrap items-center gap-2"
            >
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => chooseFilter(chip.id)}
                  aria-pressed={filter === chip.id}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-[0.8rem] font-medium transition-all duration-200",
                    filter === chip.id
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-ivory text-ink-soft hover:border-ink/30 hover:text-ink",
                  )}
                >
                  {chip.icon === "camera" ? (
                    <>
                      <CameraIcon className="h-4 w-4" aria-hidden />
                      <span className="sr-only">Reviews with photos</span>
                      <span className="tabular-nums">{chip.count}</span>
                    </>
                  ) : (
                    <>
                      {chip.label}
                      <span
                        className={cn(
                          "tabular-nums",
                          filter === chip.id
                            ? "text-ivory/60"
                            : "text-ink-mute",
                        )}
                      >
                        {chip.count}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* result line */}
            <p
              aria-live="polite"
              className="mt-6 text-[0.78rem] tracking-wide text-ink-mute tabular-nums"
            >
              {filtered.length === 0
                ? "No reviews match this filter."
                : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                    safePage * PAGE_SIZE,
                    filtered.length,
                  )} of ${filtered.length.toLocaleString("en-US")} review${
                    filtered.length === 1 ? "" : "s"
                  }`}
            </p>

            {pageItems.length === 0 ? (
              <EmptyFilterState onReset={() => chooseFilter("all")} />
            ) : (
              <ul className="mt-4 flex flex-col gap-5">
                {pageItems.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </ul>
            )}

            {filtered.length > PAGE_SIZE && (
              <Pagination
                page={safePage}
                totalPages={totalPages}
                total={filtered.length}
                onGo={goTo}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ review card ------------------------------ */

function ReviewCard({ review }: { review: ProductReview }) {
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const date = formatDate(review.createdAt);

  return (
    <li>
      <article className="h-full rounded-(--radius-card) border border-line bg-ivory p-5 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <StarRow stars={review.rating} starClassName="h-3.5 w-3.5" />
          <time
            dateTime={new Date(review.createdAt).toISOString().slice(0, 10)}
            className="text-[0.72rem] text-ink-mute tabular-nums"
          >
            {date}
          </time>
        </header>

        <blockquote className="mt-3 text-[0.92rem] leading-[1.7] text-ink-soft text-pretty">
          {review.text}
        </blockquote>

        {review.images?.length ? (
          <div className="mt-4 flex gap-2.5">
            {review.images.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setOpenPhoto(src)}
                aria-label="Open customer photo"
                className="group relative block h-24 w-24 overflow-hidden rounded-lg border border-line bg-parchment"
              >
                <Image
                  src={src}
                  alt="Customer photo of the Hematite Men's Bracelet"
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10">
                  <Icon
                    name="zoom"
                    className="size-5 text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-display text-[0.9rem] font-bold text-ivory">
            {review.author.charAt(0)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.9rem] font-semibold text-ink">
              {maskName(review.author)}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.72rem] text-ink-mute">
              {review.country}
              {review.verified && (
                <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
                  <CheckIcon className="h-3 w-3 text-volt" />
                  Verified Purchase
                </span>
              )}
            </span>
          </span>
        </figcaption>
      </article>

      <ReviewImageLightbox
        src={openPhoto}
        onClose={() => setOpenPhoto(null)}
        caption={`${maskName(review.author)} · ${review.country}`}
      />
    </li>
  );
}

/* -------------------------------- lightbox ------------------------------- */

function ReviewImageLightbox({
  src,
  onClose,
  caption,
}: {
  src: string | null;
  onClose: () => void;
  caption: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const open = src !== null;
  useScrollLock(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setZoomed(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !src) return null;

  return createPortal(
    <div className="fixed inset-0 z-100">
      <div
        onClick={onClose}
        style={{ backgroundColor: "rgba(4,4,4,0.95)" }}
        className="absolute inset-0 animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Customer review photo"
        className="absolute inset-0 flex animate-fade-in flex-col"
      >
        <div className="flex items-center justify-end px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="grid size-10 place-items-center rounded-full border border-white/20 text-chalk transition-colors duration-300 hover:border-white/50"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setZoomed((z) => !z)}
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
          className="relative mx-auto h-[72vh] w-full max-w-4xl flex-1 px-4 pb-2"
        >
          <Image
            src={src}
            alt="Customer photo of the Hematite Men's Bracelet"
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            className={cn(
              "object-contain transition-transform duration-300",
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in",
            )}
          />
        </button>

        <div className="flex items-center justify-center px-5 py-5 text-[0.78rem] text-chalk/70">
          {caption}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------ pagination ------------------------------- */

function Pagination({
  page,
  totalPages,
  total,
  onGo,
}: {
  page: number;
  totalPages: number;
  total: number;
  onGo: (p: number) => void;
}) {
  const pages = pageWindow(page, totalPages);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <nav
      aria-label="Reviews pagination"
      className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row"
    >
      <p className="text-[0.78rem] text-ink-mute tabular-nums">
        Showing {from}–{to} of {total.toLocaleString("en-US")} reviews
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onGo(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="grid size-10 place-items-center rounded-full border border-line bg-ivory text-ink transition-colors duration-200 hover:border-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="grid size-10 place-items-center text-[0.8rem] text-ink-mute"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onGo(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={cn(
                "grid size-10 place-items-center rounded-full border text-[0.82rem] font-medium tabular-nums transition-colors duration-200",
                p === page
                  ? "border-ink bg-ink text-ivory"
                  : "border-line bg-ivory text-ink-soft hover:border-ink/40 hover:text-ink",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onGo(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="grid size-10 place-items-center rounded-full border border-line bg-ivory text-ink transition-colors duration-200 hover:border-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

/* -------------------------------- helpers -------------------------------- */

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-4 rounded-(--radius-card) border border-dashed border-line-strong bg-ivory px-6 py-14 text-center">
      <p className="text-[0.95rem] font-medium text-ink">
        No reviews match this filter yet.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[0.82rem] leading-relaxed text-ink-mute">
        Try another star rating, or go back to see every review.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[0.82rem] font-semibold text-ivory transition-opacity duration-200 hover:opacity-85"
      >
        Show all reviews
      </button>
    </div>
  );
}

/** Mask a name for display, keeping ~2 letters each side: "Marcus Turner" → "Ma***us Tu***er". */
function maskWord(word: string): string {
  const clean = word.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (clean.length <= 1) return "***";
  const keep = clean.length <= 4 ? 1 : 2;
  return `${clean.slice(0, keep)}***${clean.slice(-keep)}`;
}

function maskName(full: string): string {
  const parts = full.split(" ").filter(Boolean);
  if (parts.length === 0) return "***";
  return parts.map(maskWord).join(" ");
}

function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

/** Numeric window with ellipsis gaps — e.g. [1, "…", 12, 13, 14, "…", 171]. */
function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: (number | "…")[] = [];
  const push = (n: number | "…") => {
    const last = out[out.length - 1];
    if (last === n) return;
    out.push(n);
  };
  push(1);
  if (page > 4) push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
    push(i);
  }
  if (page < total - 3) push("…");
  push(total);
  return out;
}
