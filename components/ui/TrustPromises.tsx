import { Icon, type IconName } from "@/components/ui/Icons";
import { transitRange, type TransitWindow } from "@/lib/shipping";
import { cn } from "@/lib/utils";

/**
 * The three promises under the payment logos. The 30-day line mirrors the
 * refund policy exactly (damaged / wrong / missing item, free fix, nothing to
 * send back) — it is not a change-of-mind return window, so it must not read
 * like one.
 */
const promises = (
  transit: TransitWindow,
): { icon: IconName; headline: string; line: string }[] => [
  { icon: "truck", headline: "Free shipping", line: "On every order" },
  {
    icon: "shield",
    headline: "30-day return",
    line: "Free replacement or refund",
  },
  {
    icon: "clock",
    headline: `Delivered in ${transitRange(transit)} days`,
    line: "Tracked from our door to yours",
  },
];

export function TrustPromises({
  transit,
  className,
}: {
  /** The product's delivery window — it differs by product and, for the arm trainer, by country. */
  transit: TransitWindow;
  className?: string;
}) {
  return (
    <ul
      aria-label="Our promises"
      className={cn(
        "grid grid-cols-1 gap-2.5 rounded-xl bg-cream px-4 py-3.5 sm:grid-cols-3 sm:gap-3",
        className,
      )}
    >
      {promises(transit).map((p) => (
        <li
          key={p.headline}
          className="flex items-center gap-3 sm:flex-col sm:gap-1.5 sm:text-center"
        >
          <Icon
            name={p.icon}
            className="size-5 shrink-0 text-sage-800"
            strokeWidth={1.6}
          />
          <p className="leading-tight">
            <span className="block font-ui text-[0.82rem] font-semibold text-ink">
              {p.headline}
            </span>
            <span className="mt-0.5 block text-[0.72rem] text-ink-soft">
              {p.line}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
