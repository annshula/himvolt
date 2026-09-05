import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/Motion";
import {
  CheckIcon,
  FitIcon,
  RefreshIcon,
  ShieldIcon,
  StoneIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import { quality } from "@/content/pitches";

const icons = {
  stone: StoneIcon,
  shield: ShieldIcon,
  refresh: RefreshIcon,
  fit: FitIcon,
  check: CheckIcon,
  truck: TruckIcon,
} as const;

type CheckIconName = keyof typeof icons;

/**
 * "Put to the test" — the quality/QC trust band, mounted on every product
 * page (id="quality-test", targeted from the header "Quality" link).
 *
 * The checks are our in-house pre-dispatch QC process (streak-test for
 * authenticity, hardness, daily-wear trial, fit, finish, packaging) — framed
 * as bench checks, not a fabricated third-party lab certification. Nothing
 * here invents a "scientifically proven" claim.
 */
export default function QualityTests({
  product,
}: {
  product?: { material?: string };
} = {}) {
  const magneticLine = /magnetic/i.test(product?.material ?? "");

  return (
    <Section
      id="quality-test"
      className="scroll-mt-20 overflow-hidden border-b border-line bg-canvas"
    >
      <SectionHeading
        align="center"
        eyebrow={quality.eyebrow}
        title={quality.heading}
        body={quality.lede}
      />

      <Stagger
        as="ul"
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
      >
        {quality.checks.map((check) => {
          const Icon = icons[check.icon as CheckIconName] ?? CheckIcon;
          return (
            <StaggerItem
              key={check.title}
              as="li"
              className="group relative overflow-hidden rounded-(--radius-card) border border-line bg-linen p-6 transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15"
            >
              <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.14em] text-emerald-700 uppercase">
                <CheckIcon className="h-2.5 w-2.5" />
                Pass
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-volt/30 bg-ivory text-volt">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="font-display mt-5 pr-14 text-[1rem] leading-snug font-semibold tracking-[-0.02em] text-ink">
                {check.title}
              </h3>
              <p className="mt-2 text-[0.84rem] leading-[1.6] text-ink-soft">
                {check.body}
              </p>
            </StaggerItem>
          );
        })}
      </Stagger>

      {magneticLine && (
        <Reveal
          as="p"
          className="mx-auto mt-8 max-w-160 text-center text-[0.78rem] leading-relaxed text-ink-mute"
        >
          This piece comes in magnetic and non-magnetic finishes. Each variant
          is checked against its own standard, and the material is labelled
          plainly so you always know which one you’re buying.
        </Reveal>
      )}

      <Reveal
        as="p"
        className="mx-auto mt-8 max-w-160 text-center text-[0.78rem] leading-relaxed text-ink-mute"
      >
        Every check happens in-house, by hand, before dispatch. The same mineral
        facts are laid out in full on this page.
      </Reveal>
    </Section>
  );
}
