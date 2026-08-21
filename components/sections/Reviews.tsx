import { Section, SectionHeading } from "@/components/ui/Section";
import { StarIcon, CheckIcon } from "@/components/ui/Icons";
import { reviews } from "@/content/copy";
import { site } from "@/lib/site";

/**
 * Social proof. Note that the aggregate figures are read from `site.metrics`
 * and are NOT emitted as schema.org AggregateRating until `metrics.verified`
 * is flipped on — see components/Schema.tsx.
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

  return (
    <Section id="reviews" className="grain overflow-hidden">
      <SectionHeading
        align="center"
        eyebrow="What owners say"
        title="Bought once. Worn every day since."
        body="We publish every review we receive, including the ones that sting. Below is the current standing."
      />

      {/* ----------------------------- aggregate ---------------------------- */}

      <div
        data-reveal
        className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.07] bg-white/[0.05] sm:grid-cols-[auto_1fr] lg:mt-16"
      >
        <div className="flex flex-col items-center justify-center bg-carbon px-10 py-8">
          <span className="font-display text-[3.4rem] leading-none font-extrabold tracking-[-0.05em] text-chalk tabular-nums">
            {metrics.rating.toFixed(1)}
          </span>
          <span className="mt-3 flex gap-1 text-volt" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} className="h-3.5 w-3.5" filled={i < Math.round(metrics.rating)} />
            ))}
          </span>
          <span className="mt-3 text-[0.7rem] text-dim">
            {metrics.reviewCount.toLocaleString("en-US")} verified owners
          </span>
        </div>

        <ul className="flex flex-col justify-center gap-2.5 bg-carbon px-7 py-8 sm:px-10">
          {distribution.map((d) => (
            <li key={d.stars} className="flex items-center gap-4">
              <span className="w-8 shrink-0 text-[0.7rem] text-dim tabular-nums">{d.stars}★</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-volt-deep to-volt"
                  style={{ width: `${d.pct}%` }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-[0.7rem] text-dim tabular-nums">
                {d.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ------------------------------ quotes ------------------------------ */}

      <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <li
            key={r.name}
            data-reveal
            data-reveal-delay={String((i % 3) + 1)}
            className="group relative flex flex-col rounded-[var(--radius-card)] border border-white/[0.07] bg-carbon p-7 transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-white/[0.14]"
          >
            <span
              aria-hidden
              className="font-display absolute top-4 right-6 text-[3.4rem] leading-none text-white/[0.05] select-none"
            >
              &rdquo;
            </span>

            <span className="flex gap-1 text-volt" aria-label={`${r.stars} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, s) => (
                <StarIcon key={s} className="h-3 w-3" filled={s < r.stars} />
              ))}
            </span>

            <blockquote className="mt-5 flex-1 text-[0.9rem] leading-[1.68] text-steel text-pretty">
              {r.quote}
            </blockquote>

            <footer className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] font-display text-[0.7rem] font-bold text-ash">
                {r.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.8rem] font-medium text-chalk">{r.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[0.66rem] text-dim">
                  <CheckIcon className="h-2.5 w-2.5 text-volt/80" />
                  {r.meta}
                </span>
              </span>
            </footer>
          </li>
        ))}
      </ul>
    </Section>
  );
}
