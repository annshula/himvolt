import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { CheckIcon } from "@/components/ui/Icons";
import type { BuildContent } from "@/content/pitches";

/**
 * "The build" — a clean, easy-to-read explanation of how each piece is
 * actually made. For bracelets this is the elastic core that connects the
 * stones (one continuous stretch cord, no clasp); for rings it is the solid
 * band. Mounted on every product page (id="build", targeted from the header
 * "The build" link), copy chosen to match the piece.
 */
export default function BuildSection({ content }: { content: BuildContent }) {
  return (
    <Section
      id="build"
      className="scroll-mt-20 overflow-hidden border-b border-line bg-linen"
    >
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <Reveal
            as="h2"
            delay={0.06}
            className="font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.06] font-semibold tracking-[-0.02em] text-ink text-balance"
          >
            {content.heading}
          </Reveal>
          <Reveal
            as="p"
            delay={0.14}
            className="mt-6 max-w-[46ch] text-[1rem] leading-[1.7] text-ink-soft text-pretty"
          >
            {content.lede}
          </Reveal>
          <Reveal
            as="p"
            delay={0.2}
            className="mt-6 border-l-2 border-volt/50 pl-5 text-[0.86rem] leading-relaxed text-ink-mute"
          >
            {content.note}
          </Reveal>
        </div>

        <Stagger
          as="ul"
          className="grid gap-px overflow-hidden rounded-(--radius-card) border border-line bg-line"
        >
          {content.points.map((point, i) => (
            <StaggerItem
              key={point.title}
              as="li"
              className="flex gap-4 bg-canvas p-6 transition-colors duration-300 hover:bg-ivory lg:p-8"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-volt/25 bg-ivory text-volt">
                <CheckIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.01em] text-ink">
                  <span className="mr-2 font-mono text-[0.66rem] tracking-[0.18em] text-ink-mute align-middle tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {point.title}
                </h3>
                <p className="mt-1.5 text-[0.9rem] leading-[1.65] text-ink-soft text-pretty">
                  {point.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
