import Link from "next/link";

import { countryNames } from "@/lib/availability";
import { Icon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/** The route a parcel takes, left to right. The truck leg is the one that carries the day range. */
const STOPS = [
  { icon: "package", label: "Order placed" },
  { icon: "truck", label: "Tracked shipping" },
  { icon: "check", label: "At your door" },
] as const;

/**
 * The delivery block under the accordion: the day range as the headline, a
 * three-stop route (order placed → tracked shipping → at your door), then the
 * reference's two reassurance lines (secure checkout, put-it-right policy),
 * each with its policy link. The day range is `site.delivery` — one value for
 * the whole product page, never a per-visitor estimate or a made-up date.
 */
export function DeliverySection({ shipsTo = [] }: { shipsTo?: string[] }) {
  const { minDays, maxDays } = site.delivery;

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

      <ul className="mt-5 space-y-3.5 border-t border-line pt-5">
        <li className="flex gap-3">
          <Icon name="truck" className="size-5 shrink-0" />
          <span>
            {shipsTo.length > 0
              ? `Ships to ${countryNames(shipsTo)} addresses only, tracked from dispatch.`
              : "Tracked from dispatch to your door."}{" "}
            <Link href="/shipping-policy" className="link-underline">
              Shipping details
            </Link>
          </span>
        </li>
        <li className="flex gap-3">
          <Icon name="shield" className="size-5 shrink-0" />
          <span>Secure checkout</span>
        </li>
        <li className="flex gap-3">
          <Icon name="refresh" className="size-5 shrink-0" />
          <span>
            Damaged, missing or wrong item? We&apos;ll put it right.{" "}
            <Link href="/refund-policy" className="link-underline">
              Refund policy
            </Link>
          </span>
        </li>
      </ul>
    </section>
  );
}
