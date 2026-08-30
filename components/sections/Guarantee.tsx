import { Section, SectionHeading } from "@/components/ui/Section";
import { featureIcons } from "@/components/ui/Icons";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { guarantee } from "@/content/copy";

/**
 * The policy/trust band — four real, already-established guarantees
 * (content/copy.ts `guarantee.items`, sourced from lib/site.ts `promise.*`),
 * not marketing copy invented for this section. Sits right after the
 * product showcase, before price objections have a chance to form.
 */
export default function Guarantee() {
  return (
    <Section className="border-y border-line bg-parchment py-16 lg:py-20">
      <SectionHeading
        align="center"
        eyebrow={guarantee.eyebrow}
        title={guarantee.headline}
        body={guarantee.body}
      />

      <Stagger as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guarantee.items.map((f) => {
          const Icon = featureIcons[f.icon];
          return (
            <StaggerItem
              key={f.label}
              as="li"
              className="group relative overflow-hidden rounded-(--radius-card) border border-line bg-linen p-6 transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-14 -right-14 h-36 w-36 rounded-full bg-volt/[0.14] opacity-0 blur-[48px] transition-opacity duration-700 group-hover:opacity-100"
              />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-volt/30 bg-ivory text-volt">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="font-display relative mt-5 text-[0.95rem] font-semibold tracking-[-0.02em] text-ink">
                {f.label}
              </h3>
              <p className="relative mt-2 text-[0.8rem] leading-[1.55] text-ink-soft">
                {f.body}
              </p>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
