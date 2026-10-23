"use client";

import { Icon } from "@/components/ui/Icons";
import { useLocalization } from "@/components/providers/LocalizationProvider";
import { cn } from "@/lib/utils";
import { transitForHandle } from "@/lib/shipping";

/** The route a parcel takes, left to right. The truck leg is the one that carries the day range. */
const STOPS = [
  { icon: "package", label: "Order placed" },
  { icon: "truck", label: "Tracked shipping" },
  { icon: "check", label: "At your door" },
] as const;

/**
 * The delivery block under the accordion: the day range as the headline and a
 * three-stop route (order placed → tracked shipping → at your door). The day
 * range comes from `transitForHandle` (lib/shipping.ts) for this product and
 * the shopper's country, so it matches the delivery description checkout
 * shows — never a made-up date.
 */
export function DeliverySection({ handle }: { handle: string }) {
  const { country, detectedCountry, defaultCountry } = useLocalization();
  const where = country ?? detectedCountry ?? defaultCountry?.isoCode ?? null;
  const { minDays, maxDays } = transitForHandle(handle, where);

  return (
    <section
      aria-label="Delivery"
      className="mt-6 rounded-card bg-cream/80 p-5 text-body-sm md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-ui text-[0.95rem] font-semibold">
          Delivered in{" "}
          <span className="font-numeral tabular-nums">
            {minDays}–{maxDays}
          </span>{" "}
          days
        </p>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 font-ui text-[0.72rem] leading-none font-semibold text-sage-800">
          <Icon name="check" className="size-3.5" />
          Free shipping
        </span>
      </div>

      {/* The route: three stops on a dashed line, the truck in the middle. */}
      <ol className="relative mt-5 grid grid-cols-3">
        <span
          aria-hidden="true"
          className="absolute top-4.75 right-[16.67%] left-[16.67%] h-0.5 bg-[repeating-linear-gradient(90deg,var(--color-sage-400)_0_6px,transparent_6px_12px)]"
        />
        {STOPS.map((stop, i) => (
          <li
            key={stop.label}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-full",
                i === 1
                  ? "bg-clay-600 text-white"
                  : "bg-porcelain text-sage-800 ring-2 ring-sage-300 ring-inset",
              )}
            >
              <Icon name={stop.icon} className="size-5" strokeWidth={1.6} />
            </span>
            <span className="font-ui text-[0.75rem] leading-tight font-medium">
              {stop.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
