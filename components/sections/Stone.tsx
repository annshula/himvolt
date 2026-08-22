import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { stone } from "@/content/copy";

/**
 * The editorial block. Its job is credibility, not persuasion — so it leads
 * with a verifiable mineral fact (tourmaline really is pyroelectric, which is
 * where the brand name comes from) and then explicitly draws the line at what
 * the brand will not claim. Saying "we won't tell you this cures anything" out
 * loud converts better on cold traffic than any wellness copy would.
 */
export default function Stone() {
  return (
    <Section
      id="stone"
      className="grain overflow-hidden border-y border-line bg-parchment"
    >
      {/* schorl's chemical formula as a watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 right-0 left-0 text-center font-mono text-[clamp(1.4rem,4vw,3rem)] whitespace-nowrap text-ink/5 select-none"
      >
        NaFe₃Al₆(BO₃)₃Si₆O₁₈(OH)₄
      </span>

      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>{stone.eyebrow}</Eyebrow>
          <Reveal
            as="h2"
            delay={0.06}
            className="font-display text-[clamp(2.1rem,4.4vw,3.3rem)] leading-[1.02] font-bold tracking-[-0.04em] text-balance"
          >
            {stone.headline}
          </Reveal>

          <Reveal delay={0.14} className="mt-9 border-l-2 border-volt/60 pl-6">
            <p className="text-[1.02rem] leading-[1.7] text-ink-soft text-pretty">
              {stone.lede}
            </p>
          </Reveal>

          <Reveal
            delay={0.22}
            className="mt-8 overflow-hidden rounded-(--radius-card) shadow-(--shadow-e3)"
          >
            <video
              aria-hidden
              autoPlay
              muted
              loop
              playsInline
              poster="/media/current.jpg"
              className="h-auto w-full object-cover"
            >
              <source media="(max-width: 640px)" src="/media/current-sm.mp4" type="video/mp4" />
              <source src="/media/current.webm" type="video/webm" />
              <source src="/media/current.mp4" type="video/mp4" />
            </video>
          </Reveal>

          <Reveal
            as="p"
            delay={0.3}
            className="mt-7 text-[0.92rem] leading-[1.7] text-ink-soft"
          >
            {stone.body}
          </Reveal>
        </div>

        <Stagger className="space-y-px overflow-hidden rounded-(--radius-card) border border-line bg-line">
          {stone.paragraphs.map((p, i) => (
            <StaggerItem
              key={p.title}
              as="article"
              className="bg-linen p-7 lg:p-10"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-display text-[0.66rem] tracking-[0.2em] text-ink-mute tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-[1.22rem] leading-tight font-semibold tracking-[-0.025em] text-ink">
                  {p.title}
                </h3>
              </div>
              <p className="mt-4 pl-[calc(0.66rem+1rem)] text-[0.92rem] leading-[1.72] text-ink-soft text-pretty">
                {p.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
