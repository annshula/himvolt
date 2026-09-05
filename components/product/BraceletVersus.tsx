import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Motion";
import { CheckIcon } from "@/components/ui/Icons";
import { bracelet } from "@/content/product-bracelet";
import { cn } from "@/lib/utils";

/**
 * "What you're actually buying" comparison for the bracelet page. First
 * column (this bracelet) is visually promoted; every cell is a real material
 * fact about natural hematite vs. the magnetic composite and coated beads
 * sold under the same name. Copy in content/product-bracelet.ts (versus).
 */
export default function BraceletVersus() {
  const v = bracelet.versus;

  return (
    <Section
      id="versus"
      className="overflow-hidden border-b border-line bg-ivory"
    >
      <SectionHeading
        align="center"
        eyebrow={v.eyebrow}
        title={v.heading}
        body={v.lede}
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:mt-16 lg:gap-5">
        {v.columns.map((col, colIndex) => {
          const isOurs = colIndex === 0;
          return (
            <Reveal
              key={col}
              delay={colIndex * 0.08}
              className={cn(
                "relative flex flex-col rounded-(--radius-card) border bg-linen p-6 lg:p-7",
                isOurs
                  ? "border-volt/50 shadow-(--shadow-e1) ring-1 ring-volt/20"
                  : "border-line",
              )}
            >
              {isOurs && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-volt px-3 py-1 text-[0.66rem] font-semibold tracking-wide text-on-accent uppercase">
                  <CheckIcon className="h-3 w-3" />
                  You’re looking at this one
                </span>
              )}
              <h3
                className={cn(
                  "font-display text-[1.05rem] leading-tight font-semibold tracking-[-0.02em]",
                  isOurs ? "text-ink" : "text-ink-soft",
                )}
              >
                {col}
              </h3>
              <dl className="mt-5 flex flex-1 flex-col gap-4">
                {v.rows.map((row) => (
                  <div key={row.label} className="border-t border-line pt-3.5">
                    <dt className="text-[0.62rem] font-medium tracking-[0.16em] text-ink-mute uppercase">
                      {row.label}
                    </dt>
                    <dd
                      className={cn(
                        "mt-1.5 text-[0.84rem] leading-[1.55]",
                        isOurs ? "font-medium text-ink" : "text-ink-soft",
                      )}
                    >
                      {row.values[colIndex]}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          );
        })}
      </div>

      <Reveal
        as="p"
        delay={0.1}
        className="mx-auto mt-10 max-w-184 text-center text-[0.95rem] leading-[1.7] text-ink-soft text-pretty"
      >
        {v.close}
      </Reveal>
    </Section>
  );
}
