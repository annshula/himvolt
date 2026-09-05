import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import {
  ReturnIcon,
  ShipIcon,
  ShieldIcon,
  StoneIcon,
} from "@/components/ui/Icons";
import { bracelet } from "@/content/product-bracelet";
import type { CloseContent } from "@/content/pitches";
import { site } from "@/lib/site";

/**
 * Risk-reversal close for the bracelet page. The headline promises a strong
 * "30 days / free to fix" deal, and every chip underneath is a real,
 * established policy pulled from lib/site.ts promise.* — no invented
 * change-of-mind money-back guarantee. The CTA is a same-page anchor back to
 * the buy box (#buy, added in ProductPurchase). Copy in
 * content/product-bracelet.ts (covered).
 */
export default function BraceletClose({
  content,
}: {
  /** Close copy — pass content/pitches.ts closeGeneric for non-flagship products, default is the flagship bracelet copy. */
  content?: CloseContent;
}) {
  const c = content ?? bracelet.covered;

  const chips = [
    {
      icon: <ShipIcon className="h-4.5 w-4.5" />,
      label: site.promise.shipping,
      body: site.promise.shippingDetail,
    },
    {
      icon: <ReturnIcon className="h-4.5 w-4.5" />,
      label: site.promise.returns,
      body: site.promise.returnsDetail,
    },
    {
      icon: <ShieldIcon className="h-4.5 w-4.5" />,
      label: site.promise.support,
      body: "A real person, not a bot, replies within 12 hours, 7 days a week.",
    },
    {
      icon: <StoneIcon className="h-4.5 w-4.5" />,
      label: "Genuine natural hematite",
      body: "Real iron oxide that streak-tests red-brown, not resin, not a coated bead.",
    },
  ];

  return (
    <Section
      id="covered"
      className="grain overflow-hidden border-b border-line bg-parchment"
    >
      <SectionHeading
        align="center"
        eyebrow={c.eyebrow}
        title={c.heading}
        body={c.lede}
      />

      <Stagger
        as="ul"
        className="mx-auto mt-12 grid max-w-240 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
      >
        {chips.map((chip) => (
          <StaggerItem
            key={chip.label}
            as="li"
            className="rounded-(--radius-card) border border-line bg-linen p-6"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-volt/30 bg-ivory text-volt">
              {chip.icon}
            </span>
            <h3 className="font-display mt-4 text-[0.95rem] leading-snug font-semibold text-ink">
              {chip.label}
            </h3>
            <p className="mt-2 text-[0.8rem] leading-[1.55] text-ink-soft">
              {chip.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12 flex flex-col items-center text-center lg:mt-14">
        <a
          href="#buy"
          className="group relative flex h-14 items-center gap-2.5 overflow-hidden rounded-full bg-linear-to-b from-volt-hot to-volt px-10 font-display text-[0.88rem] font-semibold tracking-widest whitespace-nowrap text-on-accent uppercase transition-all duration-400 ease-(--ease-out-expo) hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,0.42)_50%,transparent_62%)] transition-transform duration-900 ease-(--ease-out-expo) group-hover:translate-x-full"
          />
          <span className="relative">{c.cta}</span>
        </a>
        <p className="mt-4 max-w-130 text-[0.8rem] leading-relaxed text-ink-mute">
          {c.note}
        </p>
      </Reveal>
    </Section>
  );
}
