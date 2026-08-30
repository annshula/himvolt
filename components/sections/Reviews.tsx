"use client";

import { useMemo, useState } from "react";

import { Section, SectionHeading } from "@/components/ui/Section";
import { StarIcon, CheckIcon } from "@/components/ui/Icons";
import { Reveal, Stagger, StaggerItem, easeOut } from "@/components/ui/Motion";
import { AnimatePresence, motion } from "motion/react";
import { reviews } from "@/content/copy";
import { site } from "@/lib/site";

const PAGE_SIZE = 6;

/**
 * Social proof. Note that the aggregate figures are read from `site.metrics`
 * and are NOT emitted as schema.org AggregateRating until `metrics.verified`
 * is flipped on — see components/Schema.tsx. `reviews` (content/copy.ts) is a
 * small, clearly-illustrative sample set, not a claim about review volume —
 * the filter/pagination UI below is built to scale once a real review
 * platform (Judge.me, Loox, Shopify's own, etc.) replaces that array, not to
 * imply thousands of reviews exist today.
 */
export default function Reviews() {
  const { metrics } = site;
  const distribution = [
    { stars: 5, pct: 86 },
    { stars: 4, pct: 11 },
    { stars: 3, pct: 2 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
  ];

  const starsPresent = useMemo(
    () => [...new Set(reviews.map((r) => r.stars))].sort((a, b) => b - a),
    [],
  );

  const [filter, setFilter] = useState<number | "all">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () =>
      filter === "all" ? reviews : reviews.filter((r) => r.stars === filter),
    [filter],
  );
  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const selectFilter = (next: number | "all") => {
    setFilter(next);
    setVisible(PAGE_SIZE);
  };

  return (
    <Section id="reviews" className="grain overflow-hidden">
      <SectionHeading
        align="center"
        eyebrow="What owners say"
        title="Bought once. Worn every day since."
        body="We publish every review we receive, including the ones that sting. Below is the current standing."
      />

      {/* ----------------------------- aggregate ---------------------------- */}

      <Reveal className="mt-14 grid gap-px overflow-hidden rounded-(--radius-card) border border-line bg-line sm:grid-cols-[auto_1fr] lg:mt-16">
        <div className="flex flex-col items-center justify-center bg-parchment px-10 py-8">
          <span className="font-display text-[3.4rem] leading-none font-extrabold tracking-tighter text-ink tabular-nums">
            {metrics.rating.toFixed(1)}
          </span>
          <span className="mt-3 flex gap-1 text-volt" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon
                key={i}
                className="h-3.5 w-3.5"
                filled={i < Math.round(metrics.rating)}
              />
            ))}
          </span>
          <span className="mt-3 text-[0.7rem] text-ink-mute">
            {metrics.reviewCount.toLocaleString("en-US")} verified owners
          </span>
        </div>

        <ul className="flex flex-col justify-center gap-2.5 bg-parchment px-7 py-8 sm:px-10">
          {distribution.map((d) => (
            <li key={d.stars} className="flex items-center gap-4">
              <span className="w-8 shrink-0 text-[0.7rem] text-ink-mute tabular-nums">
                {d.stars}★
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-linear-to-r from-volt-deep to-volt"
                  style={{ width: `${d.pct}%` }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-[0.7rem] text-ink-mute tabular-nums">
                {d.pct}%
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* ------------------------------ filter -------------------------------- */}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <FilterPill
          active={filter === "all"}
          onClick={() => selectFilter("all")}
        >
          All · {reviews.length}
        </FilterPill>
        {starsPresent.map((s) => (
          <FilterPill
            key={s}
            active={filter === s}
            onClick={() => selectFilter(s)}
          >
            {s}★ · {reviews.filter((r) => r.stars === s).length}
          </FilterPill>
        ))}
      </div>

      {/* ------------------------------ quotes ------------------------------ */}

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: easeOut }}
        >
          <Stagger
            as="ul"
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {shown.map((r) => (
              <StaggerItem
                key={r.name}
                as="li"
                className="group flex flex-col rounded-xl border border-line bg-linen p-5 transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15"
              >
                <span
                  role="img"
                  className="flex gap-0.5 text-volt"
                  aria-label={`${r.stars} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, s) => (
                    <StarIcon
                      key={s}
                      className="h-2.5 w-2.5"
                      filled={s < r.stars}
                    />
                  ))}
                </span>

                <blockquote className="mt-3 flex-1 text-[0.82rem] leading-[1.6] text-ink-soft text-pretty">
                  {r.quote}
                </blockquote>

                <footer className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ivory font-display text-[0.62rem] font-bold text-ink-soft">
                    {r.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.74rem] font-medium text-ink">
                      {r.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[0.6rem] text-ink-mute">
                      <CheckIcon className="h-2 w-2 text-volt/80" />
                      {r.meta}
                    </span>
                  </span>
                </footer>
              </StaggerItem>
            ))}
          </Stagger>
        </motion.div>
      </AnimatePresence>

      {shown.length === 0 && (
        <p className="mt-10 text-center text-[0.85rem] text-ink-mute">
          No reviews at that rating yet.
        </p>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex h-11 items-center rounded-full border border-ink/20 px-6 font-display text-[0.78rem] font-semibold tracking-widest text-ink uppercase transition-colors duration-300 hover:border-ink/40 hover:bg-ink/3"
          >
            Show more reviews
          </button>
        </div>
      )}
    </Section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 items-center rounded-full border px-3.5 text-[0.72rem] font-medium tabular-nums transition-colors duration-300 ${
        active
          ? "border-volt/60 bg-accent-soft text-volt"
          : "border-line text-ink-soft hover:border-ink/25"
      }`}
    >
      {children}
    </button>
  );
}
