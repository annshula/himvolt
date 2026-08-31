import { Section, SectionHeading } from "@/components/ui/Section";
import { StarIcon, CheckIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Motion";
import { reviews } from "@/content/copy";
import { site } from "@/lib/site";

/**
 * Social proof. Note that the aggregate figures are read from `site.metrics`
 * and are NOT emitted as schema.org AggregateRating until `metrics.verified`
 * is flipped on — see components/Schema.tsx. `reviews` (content/copy.ts) is a
 * small, clearly-illustrative sample set, not a claim about review volume.
 *
 * Two rails scrolling in opposite directions (CSS animation, no JS on the
 * scroll path) rather than a filterable/paginated grid — the same pattern
 * `reference/src/components/sections/Reviews.tsx`'s Marquee component uses,
 * built on the `.marquee`/`.marquee-track` keyframes this codebase already
 * ships in app/globals.css (previously only used by a disabled announcement
 * bar). Each rail holds two copies of its list so the loop has no seam.
 */
export default function Reviews() {
  const { metrics } = site;
  const distribution = [
    { stars: 5, pct: 86 },
    { stars: 4, pct: 11 },
    { stars: 3, pct: 0 },
    { stars: 2, pct: 0 },
    { stars: 1, pct: 0 },
  ];

  const reversed = [...reviews].reverse();

  return (
    <Section id="reviews" className="grain overflow-hidden">
      <SectionHeading
        align="center"
        eyebrow="What owners say"
        title="Bought once. Worn every day since."
        body="We publish every review we receive, including the ones that sting. Below is the current standing."
      />

      {/* ----------------------------- aggregate ---------------------------- */}

      <Reveal className="mx-auto mt-14 grid max-w-184 gap-px overflow-hidden rounded-(--radius-card) border border-line bg-line sm:grid-cols-[auto_1fr] lg:mt-16">
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

      {/* ------------------------------ rails --------------------------------- */}

      <Reveal delay={0.1} className="mt-12 flex flex-col gap-5 lg:mt-14">
        <MarqueeRail items={reviews} duration={46} />
        <MarqueeRail items={reversed} duration={54} reverse />
      </Reveal>
    </Section>
  );
}

function MarqueeRail({
  items,
  duration,
  reverse = false,
}: {
  items: typeof reviews;
  duration: number;
  reverse?: boolean;
}) {
  return (
    <div className="marquee marquee-mask -mx-5 overflow-hidden sm:-mx-8">
      <div
        className="marquee-track gap-4 px-2"
        style={{
          ["--dur" as string]: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 gap-4"
          >
            {items.map((r) => (
              <ReviewCard key={`${copy}-${r.name}`} {...r} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  quote,
  name,
  meta,
  stars,
}: {
  quote: string;
  name: string;
  meta: string;
  stars: number;
}) {
  return (
    <figure className="flex w-76 shrink-0 flex-col rounded-xl border border-line bg-linen p-5">
      <span
        role="img"
        className="flex gap-0.5 text-volt"
        aria-label={`${stars} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, s) => (
          <StarIcon key={s} className="h-2.5 w-2.5" filled={s < stars} />
        ))}
      </span>

      <blockquote className="mt-3 flex-1 text-[0.82rem] leading-[1.6] text-ink-soft text-pretty">
        {quote}
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ivory font-display text-[0.62rem] font-bold text-ink-soft">
          {name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[0.74rem] font-medium text-ink">
            {name}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[0.6rem] text-ink-mute">
            <CheckIcon className="h-2 w-2 text-volt/80" />
            {meta}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
