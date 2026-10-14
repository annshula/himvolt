"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icons";

/** Remaining time to a real, merchant-set Shopify deadline — null once it has passed. */
function remaining(
  target: number,
): { days: number; hours: number; minutes: number; seconds: number } | null {
  const ms = target - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  // Past 99 hours a bare hour count stops reading as a clock ("109:52:51"),
  // so the day count is split out: 4d 13:52:51.
  const showDays = totalHours > 99;
  return {
    days: showDays ? Math.floor(totalHours / 24) : 0,
    hours: showDays ? totalHours % 24 : totalHours,
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * Offer countdown — only ever renders a deadline the merchant actually set in
 * Shopify (`custom.sale_ends_at`, synced into `Product.saleEndsAt`); the sync
 * already drops past dates, and this component hides itself the moment the
 * real deadline passes rather than freezing at 00:00:00 or looping.
 *
 * Sits beside the free-delivery strip at every width, so it is a compact
 * two-line box (label over digits) rather than a single wide line.
 *
 * Starts as `null` on both the server and the client's first paint — the
 * exact countdown depends on the visitor's clock the moment their page
 * loads, which the server can never predict (worse still with ISR: the HTML
 * may have been generated minutes or hours earlier). Computing it eagerly in
 * `useState`'s initializer would make the server-rendered text disagree with
 * what the client immediately recomputes, which is a hydration mismatch, not
 * just a visual flicker. Filling it in from an effect after mount avoids
 * that entirely, at the cost of one tick where nothing renders.
 */
export function SaleCountdown({ endsAt }: { endsAt: string }) {
  const target = Date.parse(endsAt);
  const [left, setLeft] = useState<ReturnType<typeof remaining>>(null);

  useEffect(() => {
    setLeft(remaining(target));
    const id = setInterval(() => setLeft(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!left) return null;

  const clock = [left.hours, left.minutes, left.seconds];

  return (
    <div
      role="timer"
      aria-live="off"
      className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-clay-300 bg-clay-50 px-2.5 py-1.5 font-ui text-clay-600"
    >
      <span className="flex items-center gap-1 text-[0.7rem] leading-none font-semibold whitespace-nowrap">
        <Icon
          name="clock"
          className="size-3.5 shrink-0 motion-safe:animate-[free-pop_1.2s_ease-in-out_infinite]"
        />
        Hurry! Offer ends in
      </span>
      <span
        className="flex items-center gap-1 font-numeral text-[0.95rem] leading-none font-bold whitespace-nowrap tabular-nums"
        aria-hidden="true"
      >
        {left.days > 0 && <span>{left.days}d</span>}
        <span className="flex items-center gap-0.5">
          {clock.map((value, i) => (
            <span key={i} className="flex items-center gap-0.5">
              {i > 0 && <span className="opacity-70">:</span>}
              <span>{pad(value)}</span>
            </span>
          ))}
        </span>
      </span>
      <span className="sr-only">
        Offer ends in {left.days > 0 ? `${left.days} days ` : ""}
        {left.hours} hours {left.minutes} minutes
      </span>
    </div>
  );
}
