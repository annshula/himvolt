"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  SignOutDialog,
  SignOutLabel,
} from "@/components/account/SignOutDialog";
import { Icon } from "@/components/ui/Icons";
import type { IconName } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

type AccountLink = { href: string; label: string; icon: IconName };

const LINKS: AccountLink[] = [
  { href: "/account", label: "Account", icon: "user" },
  { href: "/account/orders", label: "Orders", icon: "package" },
  { href: "/account/addresses", label: "Addresses", icon: "map-pin" },
];

/**
 * Header account entry point.
 *
 * `dropdown` (desktop): a circular user-icon button that opens a menu with
 * Account / Orders / Addresses / Sign out when signed in, or the same
 * cart-style user icon (no label) that routes to the Shopify Customer Account
 * flow when signed out.
 *
 * `list` (mobile drawer): bare icon buttons — account, and sign-out when
 * signed in — meant to sit in the drawer's icon row.
 *
 * Sign-in state is probed from `/api/account/session` on mount and whenever
 * the route changes, so it stays correct after login/logout redirects.
 */
export function AccountMenu({
  variant = "dropdown",
  dark = false,
  overHero = false,
  className,
}: {
  variant?: "dropdown" | "list";
  dark?: boolean;
  /** Over the transparent hero header: light text + translucent hover. */
  overHero?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  /* The dropdown unmounts on close, so the confirmation is rendered from this
     component's root instead — closing the menu must not kill the dialog. */
  const askSignOut = () => {
    setOpen(false);
    setSignOutOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/session")
      .then((res) => (res.ok ? res.json() : { signedIn: false }))
      .then((data: { signedIn?: boolean }) => {
        if (!cancelled) setSignedIn(Boolean(data.signedIn));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  /* Close the dropdown on outside click or Escape. */
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkRow = (link: AccountLink, tone: "dark" | "light") => (
    <Link
      key={link.href}
      href={link.href}
      role="menuitem"
      onClick={() => setOpen(false)}
      className={cn(
        "flex items-center gap-2.5 text-[0.72rem] font-semibold tracking-[0.14em] uppercase transition-colors duration-200",
        tone === "dark"
          ? "rounded-full px-3 py-2.5 text-ink hover:bg-parchment"
          : "rounded-xl px-2 py-3 text-white/90 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon
        name={link.icon}
        className={cn(
          "size-4 shrink-0",
          tone === "dark" ? "text-ink" : "text-white/70",
        )}
      />
      {link.label}
    </Link>
  );

  /* ── Mobile drawer: one row, never a nested menu ─────────────────────── */
  if (variant === "list") {
    const iconButton = cn(
      "grid size-11 place-items-center rounded-md transition-colors duration-300",
      dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5",
    );

    return (
      <>
        <Link
          href={signedIn ? "/account" : "/account/login"}
          aria-label={signedIn ? "Your account" : "Sign in"}
          className={cn(iconButton, className)}
        >
          <Icon name="user" className="size-5" />
        </Link>

        {signedIn && (
          <button
            type="button"
            onClick={() => setSignOutOpen(true)}
            aria-label="Sign out"
            className={cn(
              iconButton,
              dark && "hover:bg-red-500/15 hover:text-red-300",
            )}
          >
            <Icon name="logout" className="size-5" />
          </button>
        )}

        <SignOutDialog
          open={signOutOpen}
          onClose={() => setSignOutOpen(false)}
        />
      </>
    );
  }

  /* ── Desktop: icon button + dropdown, or a cart-style Sign-in icon ── */
  if (signedIn === false) {
    return (
      <Link
        href="/account/login"
        aria-label="Sign in"
        className={cn(
          "hidden size-11 place-items-center rounded-md transition-colors duration-300 sm:grid",
          overHero ? "text-white hover:bg-white/15" : "text-ink hover:bg-ink/5",
        )}
      >
        <Icon name="user" className="size-5" />
      </Link>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Your account"
        className={cn(
          "grid size-11 place-items-center rounded-md transition-colors duration-300",
          overHero ? "text-white hover:bg-white/15" : "text-ink hover:bg-ink/5",
        )}
      >
        <Icon name="user" className="size-5" />
      </button>

      {open && signedIn && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-card border border-line bg-ivory p-1.5 shadow-[var(--shadow-lift)]"
        >
          <div className="px-3 pt-2 pb-1.5">
            <p className="text-[0.62rem] font-semibold tracking-[0.24em] text-ink uppercase">
              My account
            </p>
          </div>
          <div className="flex flex-col">
            {LINKS.map((link) => linkRow(link, "dark"))}
          </div>
          <div className="mt-1.5 border-t border-line pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={askSignOut}
              className="flex w-full items-center gap-2.5 rounded-full px-3 py-2.5 text-[0.72rem] font-semibold tracking-[0.14em] text-ink-soft uppercase transition-colors duration-200 hover:bg-parchment hover:text-red-700"
            >
              <SignOutLabel />
            </button>
          </div>
        </div>
      )}

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </div>
  );
}
