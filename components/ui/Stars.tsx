import { StarIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Star rating primitives for review UI.
 *
 * - `StarRow` — whole stars for a single review ("4 out of 5").
 * - `RatingStars` — fractional precision for aggregate figures (4.7), drawn
 *   as an outline row under a copper fill clipped to `value / 5` width so a
 *   partial fifth star reads accurately instead of rounding up to 5.
 *
 * Colours follow the brand token convention already used across the site:
 * filled = volt (the warm copper accent), empty = line-strong (a quiet
 * hairline grey) — see app/globals.css @theme.
 */

function Row({ count, className }: { count: number; className?: string }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          filled={i < count}
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            i < count ? "text-volt" : "text-line-strong",
            className,
          )}
        />
      ))}
    </>
  );
}

export function StarRow({
  stars,
  className,
  starClassName,
}: {
  stars: number;
  className?: string;
  starClassName?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${stars} out of 5 stars`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      <Row count={stars} className={starClassName} />
    </span>
  );
}

export function RatingStars({
  value,
  className,
  starClassName,
}: {
  value: number;
  className?: string;
  starClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const pct = (clamped / 5) * 100;
  return (
    <span
      role="img"
      aria-label={`${clamped} out of 5 stars`}
      className={cn("relative inline-flex items-center", className)}
    >
      <span className="flex items-center gap-0.5 text-line-strong">
        <Row count={0} className={starClassName} />
      </span>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <span className="flex items-center gap-0.5 text-volt">
          <Row count={5} className={starClassName} />
        </span>
      </span>
    </span>
  );
}
