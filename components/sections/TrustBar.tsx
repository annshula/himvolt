import Counter from "@/components/ui/Counter";
import {
  StarIcon,
  GlobeIcon,
  ReturnIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { site } from "@/lib/site";

/**
 * The credibility strip. Deliberately typographic — no imagery, no cards, no
 * colour. It reads as fact rather than marketing, which is the whole job.
 */
export default function TrustBar() {
  const { metrics, promise } = site;

  return (
    <section
      aria-label="Why people buy from us"
      className="relative z-10 border-y border-line bg-parchment backdrop-blur-sm"
    >
      <Stagger className="mx-auto grid max-w-310 grid-cols-2 divide-line px-5 sm:px-8 lg:grid-cols-4 lg:divide-x">
        <Item
          icon={<StarIcon />}
          headline={
            <>
              <Counter to={metrics.rating} decimals={1} />
              <span className="text-ink-mute"> / 5</span>
            </>
          }
          label={`from ${metrics.reviewCount.toLocaleString("en-US")} owners`}
          aside={
            <span className="flex gap-0.5 text-volt" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                  key={i}
                  className="h-3 w-3"
                  filled={i < Math.round(metrics.rating)}
                />
              ))}
            </span>
          }
        />

        <Item
          icon={<CheckIcon />}
          headline={<Counter to={metrics.unitsWorn} suffix="+" />}
          label={`bands worn across ${metrics.countries} countries`}
        />

        <Item
          icon={<GlobeIcon />}
          headline={<>Free</>}
          label={promise.shippingDetail}
        />

        <Item
          icon={<ReturnIcon />}
          headline={<>30 days</>}
          label={promise.returnsDetail}
        />
      </Stagger>
    </section>
  );
}

function Item({
  icon,
  headline,
  label,
  aside,
}: {
  icon: React.ReactNode;
  headline: React.ReactNode;
  label: string;
  aside?: React.ReactNode;
}) {
  return (
    <StaggerItem className="flex items-start gap-3.5 px-1 py-6 sm:px-5 lg:justify-center lg:py-7">
      <span className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-mute">{icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-[1.15rem] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
            {headline}
          </span>
          {aside}
        </div>
        <p className="mt-1.5 text-[0.7rem] leading-snug text-ink-mute">
          {label}
        </p>
      </div>
    </StaggerItem>
  );
}
