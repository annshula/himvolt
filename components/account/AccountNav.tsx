"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  SignOutDialog,
  SignOutLabel,
} from "@/components/account/SignOutDialog";
import { Icon, type IconName } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
};

const items: NavItem[] = [
  { href: "/account", label: "Overview", icon: "user", exact: true },
  { href: "/account/orders", label: "Orders", icon: "package" },
  { href: "/account/addresses", label: "Addresses", icon: "map-pin" },
  { href: "/account/profile", label: "Profile", icon: "feather" },
];

/**
 * Account nav, two shapes from one markup.
 *
 * Desktop (lg+): a white card of icon chips on the canvas, ink fill marking
 * the current page, with sign-out under a hairline.
 *
 * Mobile: no card, no icons, no sign-out — just the site's tracked uppercase
 * labels on a scrolling rule, so the nav costs one line instead of a panel.
 * Sign-out lives in the header drawer at that width.
 */
export function AccountNav() {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav aria-label="Account" className="w-full min-w-0">
      <div className="min-w-0 lg:rounded-[var(--radius-card)] lg:border lg:border-line lg:bg-ivory lg:p-3 lg:shadow-sm">
        {/* The row is wider than a phone and scrolls inside itself; min-w-0
            here and on every ancestor keeps that from widening the page. */}
        <ul className="scrollbar-none flex min-w-0 gap-7 overflow-x-auto border-b border-line lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.href} className="shrink-0 lg:shrink">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px block border-b-2 pb-3 text-[0.72rem] font-semibold tracking-[0.2em] whitespace-nowrap uppercase transition-colors duration-300",
                    "lg:mb-0 lg:flex lg:items-center lg:gap-2.5 lg:rounded-full lg:border-b-0 lg:px-4 lg:py-3 lg:tracking-[0.14em]",
                    active
                      ? "border-ink text-ink lg:bg-ink lg:text-white"
                      : "border-transparent text-ink-mute hover:text-ink lg:text-ink-soft lg:hover:bg-parchment lg:hover:text-ink",
                  )}
                >
                  <Icon
                    name={item.icon}
                    className="hidden size-4 shrink-0 lg:block"
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:mt-2 lg:block lg:border-t lg:border-line lg:pt-2">
          <button
            type="button"
            onClick={() => setSignOutOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-full px-4 py-3 text-[0.72rem] font-semibold tracking-[0.14em] text-ink-mute uppercase transition-colors duration-300 hover:bg-parchment hover:text-red-700"
          >
            <SignOutLabel />
          </button>
        </div>
      </div>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </nav>
  );
}
