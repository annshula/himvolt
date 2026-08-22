import { Section } from "@/components/ui/Section";
import { featureIcons } from "@/components/ui/Icons";
import { features } from "@/content/copy";

/** Quick-scan reasons to buy. Icon, label, one line — nothing more. */
export default function Features() {
  return (
    <Section className="py-20 lg:py-24">
      <ul className="grid gap-5 sm:grid-cols-3">
        {features.map((f, i) => {
          const Icon = featureIcons[f.icon];
          return (
            <li
              key={f.label}
              data-reveal
              data-reveal-delay={String(i + 1)}
              className="group relative overflow-hidden rounded-(--radius-card) border border-line bg-linen p-7 transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15 lg:p-8"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-volt/[0.14] opacity-0 blur-[50px] transition-opacity duration-700 group-hover:opacity-100"
              />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-ivory p-2.5 text-ink-soft transition-colors duration-500 group-hover:border-volt/40 group-hover:text-volt">
                <Icon />
              </span>
              <h3 className="font-display relative mt-6 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
                {f.label}
              </h3>
              <p className="relative mt-2.5 text-[0.86rem] leading-[1.65] text-ink-soft">
                {f.body}
              </p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
