import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icons";

/**
 * The "nothing here yet" panel — an empty account never looks like a broken
 * page.
 */
export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-(--radius-card) border border-line bg-ivory px-6 py-14 text-center shadow-sm">
      <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-parchment text-ink">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="font-display relative mt-5 text-2xl font-extrabold tracking-[-0.03em] text-ink">
        {title}
      </p>
      <p className="relative mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
        {body}
      </p>
      {children && <div className="relative mt-6">{children}</div>}
    </div>
  );
}
