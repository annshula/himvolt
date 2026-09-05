import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { CheckIcon, StarIcon } from "@/components/ui/Icons";
import { reviewsLanding, type ReviewLandingContent } from "@/content/pitches";
import { site } from "@/lib/site";

/**
 * The reviews space on product pages that don't yet have a real review
 * dataset — a designed, verified-only landing state with no fabricated
 * numbers or demo review text. The full feed (components/product/
 * ProductReviews.tsx) is used for the flagship bracelet and can be dropped
 * in for any product once it has a real dataset.
 */
export default function ReviewsComing({
  content,
}: {
  content?: ReviewLandingContent;
} = {}) {
  const r = content ?? reviewsLanding;

  return (
    <Section
      id="reviews"
      className="scroll-mt-20 border-b border-line bg-parchment/60"
    >
      <SectionHeading
        align="center"
        eyebrow={r.eyebrow}
        title={r.heading}
        body={r.body}
      />

      <Reveal className="mx-auto mt-12 max-w-184 overflow-hidden rounded-(--radius-card) border border-line bg-ivory shadow-(--shadow-e1) lg:mt-16">
        <div className="grid items-center gap-8 px-8 py-10 sm:grid-cols-[auto_1fr] sm:gap-10 lg:px-12">
          <div className="mx-auto flex flex-col items-center sm:mx-0">
            <span aria-hidden className="flex gap-1.5 text-volt/30">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} className="h-7 w-7" />
              ))}
            </span>
            <p className="mt-3 text-[0.68rem] font-medium tracking-[0.18em] text-ink-mute uppercase">
              Verified owners only
            </p>
          </div>

          <div>
            <Stagger as="ul" className="flex flex-col gap-3">
              {r.points.map((point) => (
                <StaggerItem
                  key={point}
                  as="li"
                  className="flex items-start gap-3 text-[0.92rem] leading-[1.6] text-ink-soft"
                >
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-volt" />
                  {point}
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-6 border-t border-line pt-5 text-[0.8rem] leading-relaxed text-ink-mute">
              Already wearing one?{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-ink underline underline-offset-2 transition-colors hover:text-volt"
              >
                Email us your thoughts
              </a>
              . The honest ones help most.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
