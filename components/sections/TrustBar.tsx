"use client";

import {
  CheckIcon,
  GlobeIcon,
  ShieldIcon,
  StoneIcon,
} from "@/components/ui/Icons";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { OVERALL_TRANSIT, transitRange } from "@/lib/shipping";

/**
 * The credibility strip. Deliberately typographic — no imagery, no cards, no
 * colour. It reads as fact rather than marketing, which is the whole job.
 *
 * Every figure here is a product fact or a store policy already stated on
 * the product pages — no review score, no units-sold count.
 */
export default function TrustBar() {
  const shippingLabel = `Tracked shipping · dispatched in 1–3 business days · ${transitRange(OVERALL_TRANSIT)} days to arrive`;

  return (
    <section
      aria-label="Why people buy from us"
      className="relative z-10 border-y border-line bg-parchment backdrop-blur-sm"
    >
      <Stagger className="mx-auto grid max-w-310 grid-cols-1 divide-y divide-line px-5 sm:grid-cols-2 sm:divide-y-0 sm:px-8 lg:grid-cols-4 lg:divide-x">
        <Item icon={<GlobeIcon />} headline={<>Free</>} label={shippingLabel} />

        <Item
          icon={<CheckIcon />}
          headline={<>22–440 lb</>}
          label="adjustable hydraulic resistance, with a rep counter"
        />

        <Item
          icon={<StoneIcon />}
          headline={<>5.5–6.5</>}
          label="Mohs hardness, natural hematite on par with steel"
        />

        <Item
          icon={<ShieldIcon />}
          headline={<>30 days</>}
          label="to report a damaged or wrong item, free fix"
        />
      </Stagger>
    </section>
  );
}

function Item({
  icon,
  headline,
  label,
}: {
  icon: React.ReactNode;
  headline: React.ReactNode;
  label: string;
}) {
  return (
    <StaggerItem className="flex items-start gap-3.5 px-1 py-5 sm:px-5 sm:py-6 lg:items-center lg:justify-center lg:py-7">
      <span className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-mute lg:mt-0">
        {icon}
      </span>
      <div className="min-w-0">
        <span className="font-display text-[1.15rem] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums whitespace-nowrap">
          {headline}
        </span>
        <p className="mt-1.5 text-[0.7rem] leading-snug text-ink-mute">
          {label}
        </p>
      </div>
    </StaggerItem>
  );
}
