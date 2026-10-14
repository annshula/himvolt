import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icons";

/**
 * Compact buy-box accordion — a quick reference next to the price. Native
 * <details>, so it works without JS and keyboard/screen-reader behaviour
 * comes for free. The full detail still lives further down the page.
 */
export function ProductAccordion({
  items,
}: {
  items: { title: string; body: ReactNode }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 flex flex-col divide-y divide-sand border-y border-sand">
      {items.map((item) => (
        <details key={item.title} className="group py-1">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 text-body-sm font-semibold [&::-webkit-details-marker]:hidden">
            {item.title}
            <Icon
              name="plus"
              className="size-4 shrink-0 text-ink-soft transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <div className="pb-4 text-body-sm text-ink-soft">{item.body}</div>
        </details>
      ))}
    </div>
  );
}
