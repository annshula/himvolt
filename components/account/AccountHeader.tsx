import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * The account area's page header: breadcrumbs, an optional eyebrow, the page
 * title (display caps — HimVolt's voice is deliberate and black & white) and a
 * supporting line, then any extra content the page hangs beneath it.
 */
export function AccountHeader({
  eyebrow,
  title,
  body,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  /** Trailing crumbs — "Home / Account" is always prepended. */
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <header className="min-w-0">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-[0.68rem] tracking-[0.06em] text-ink-mute"
      >
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/account" className="transition-colors hover:text-ink">
          Account
        </Link>
        {(crumbs ?? []).map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-ink"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="max-w-[16ch] truncate text-ink-soft">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {eyebrow && (
        <p className="mt-6 flex items-center gap-3 text-[0.62rem] font-semibold tracking-[0.24em] text-ink-mute uppercase">
          <span
            aria-hidden="true"
            className="inline-block h-px w-8 bg-ink/30"
          />
          {eyebrow}
        </p>
      )}

      <h1
        className={cn(
          "font-display text-[clamp(1.9rem,1.4rem+1.8vw,2.75rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink",
          eyebrow ? "mt-3" : "mt-6",
        )}
      >
        {title}
      </h1>

      {body && (
        <p className="mt-3 max-w-[56ch] text-[0.95rem] leading-relaxed text-ink-soft">
          {body}
        </p>
      )}

      {children}
    </header>
  );
}
