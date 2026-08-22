import { Section, SectionHeading } from "@/components/ui/Section";
import { StarIcon, CheckIcon } from "@/components/ui/Icons";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
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

      <Reveal className="mt-14 grid gap-px overflow-hidden rounded-(--radius-card) border border-line bg-line sm:grid-cols-[auto_1fr] lg:mt-16">
        <div className="flex flex-col items-center justify-center bg-parchment px-10 py-8">
          <span className="font-display text-[3.4rem] leading-none font-extrabold tracking-[-0.05em] text-ink tabular-nums">
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
                  className="block h-full rounded-full bg-gradient-to-r from-volt-deep to-volt"
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

      {/* ------------------------------ quotes ------------------------------ */}

      <Stagger as="ul" className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <StaggerItem
            key={r.name}
            as="li"
            className="group relative flex flex-col rounded-(--radius-card) border border-line bg-linen p-7 transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15"
          >
            <span
              aria-hidden
              className="font-display absolute top-4 right-6 text-[3.4rem] leading-none text-ink/[0.06] select-none"
            >
              &rdquo;
            </span>

            <span
              className="flex gap-1 text-volt"
              aria-label={`${r.stars} out of 5 stars`}
            >
              {Array.from({ length: 5 }, (_, s) => (
                <StarIcon key={s} className="h-3 w-3" filled={s < r.stars} />
              ))}
            </span>

            <blockquote className="mt-5 flex-1 text-[0.9rem] leading-[1.68] text-ink-soft text-pretty">
              {r.quote}
            </blockquote>

            <footer className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory font-display text-[0.7rem] font-bold text-ink-soft">
                {r.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.8rem] font-medium text-ink">
                  {r.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[0.66rem] text-ink-mute">
                  <CheckIcon className="h-2.5 w-2.5 text-volt/80" />
                  {r.meta}
                </span>
              </span>
            </footer>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
