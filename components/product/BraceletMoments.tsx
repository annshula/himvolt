import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { bracelet } from "@/content/product-bracelet";
import type { MomentsContent } from "@/content/pitches";

/**
 * Benefit section for hematite product pages — the "what it's actually for"
 * block. Feeling language only, sold hard. Copy comes from a per-product
 * pitch (content/pitches.ts) or defaults to the flagship bracelet copy.
 */
export default function BraceletMoments({
  moments,
}: {
  moments?: MomentsContent;
}) {
  const m = moments ?? bracelet.moments;

  return (
    <Section
      id="moments"
      className="grain overflow-hidden border-y border-line bg-parchment"
    >
      <SectionHeading
        align="center"
        eyebrow={m.eyebrow}
        title={m.heading}
        body={m.lede}
      />

      <Stagger
        as="ul"
        className="mx-auto mt-12 grid max-w-240 gap-px overflow-hidden rounded-(--radius-card) border border-line bg-line sm:grid-cols-2 lg:mt-16"
      >
        {m.items.map((item, i) => (
          <StaggerItem
            key={item.title}
            as="li"
            className="group bg-linen p-7 transition-colors duration-500 hover:bg-ivory lg:p-10"
          >
            <span className="font-display text-[0.66rem] tracking-[0.2em] text-ink-mute tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-4 text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
              {item.title}
            </h3>
            <p className="mt-3 text-[0.92rem] leading-[1.7] text-ink-soft text-pretty">
              {item.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
