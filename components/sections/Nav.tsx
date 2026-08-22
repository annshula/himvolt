"use client";

import { useEffect, useState } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { CurrencySelector } from "@/components/localization/CurrencySelector";
import { useCart } from "@/components/providers/CartProvider";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

const links = [
  { label: "The band", href: "#showcase" },
  { label: "The stone", href: "#stone" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
];

function CartButton({
  solid,
  onOpen,
}: {
  solid: boolean;
  onOpen?: () => void;
}) {
  const { count, open } = useCart();
  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.();
        open();
      }}
      aria-label={`Open shopping bag${count > 0 ? ` (${count} items)` : ""}`}
      className={cn(
        "relative grid size-11 place-items-center rounded-md transition-colors duration-300",
        solid ? "text-ink hover:bg-ink/5" : "text-white hover:bg-white/15",
      )}
    >
      <Icon name="bag" className="size-6" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 font-display text-[0.6rem] font-semibold tracking-tight tabular-nums ring-2",
            solid
              ? "bg-ink text-white ring-ivory"
              : "bg-white text-ink ring-white/40",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: openCart } = useCart();
  useScrollLock(menuOpen);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-[var(--ease-out-expo)] ${
          solid ? "bg-canvas/85 backdrop-blur-xl" : "bg-transparent"
        }`}
        style={{ height: "var(--nav-h)" }}
      >
        <nav className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-4 px-5 sm:gap-6 sm:px-8">
          <Logo className={solid ? "text-ink" : "text-chalk"} />

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`group relative text-[0.78rem] font-medium tracking-[0.02em] transition-colors duration-300 ${
                    solid
                      ? "text-ink-soft hover:text-ink"
                      : "text-chalk/90 hover:text-white"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px w-0 transition-all duration-400 ease-[var(--ease-out-expo)] group-hover:w-full ${
                      solid ? "bg-ink" : "bg-chalk"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-end gap-0.5">
            <span className="hidden lg:block">
              <CurrencySelector variant="bar" overHero={!solid} />
            </span>
            <CartButton solid={solid} onOpen={() => setMenuOpen(false)} />
            <span className="hidden sm:block">
              <AccountMenu variant="dropdown" overHero={!solid} />
            </span>
            <span className="ml-1.5 hidden sm:block">
              <Button
                href="#collection"
                size="md"
                variant={solid ? "volt" : "invert"}
              >
                Show now
              </Button>
            </span>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={cn(
                "grid size-11 place-items-center rounded-md transition-colors duration-300 md:hidden",
                solid
                  ? "text-ink hover:bg-ink/5"
                  : "text-white hover:bg-white/15",
              )}
            >
              {/* hamburger */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-[1.625rem]"
                aria-hidden
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Reading progress. Scroll-driven where supported, invisible otherwise. */}
        <div
          aria-hidden
          className={`scroll-progress absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r ${
            solid
              ? "from-ink via-ink to-ink"
              : "from-chalk/70 via-chalk to-chalk/70"
          }`}
        />
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[80] md:hidden",
          !menuOpen && "pointer-events-none",
        )}
        inert={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/60 backdrop-blur-[2px] transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ink px-6 pt-5 pb-8 text-chalk shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[var(--ease-out-expo)]",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-semibold tracking-[0.24em] text-chalk uppercase">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid size-10 place-items-center rounded-full border border-white/25 text-chalk transition-colors duration-300 hover:border-white/70"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>

          <ul className="mt-10 flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-white/10 py-4 font-display text-lg font-semibold tracking-[-0.02em] text-chalk/90 transition-colors duration-300 hover:text-white"
                >
                  {l.label}
                  <Icon name="arrow-right" className="size-4 text-white/40" />
                </a>
              </li>
            ))}
          </ul>

          {/* Icon row: currency, account + sign-out, bag */}
          <div className="mt-auto flex items-center justify-center gap-3 pt-10">
            <CurrencySelector variant="drawer" dark />
            <AccountMenu variant="list" dark />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              aria-label="Open shopping bag"
              className="grid size-11 place-items-center rounded-md text-white transition-colors duration-300 hover:bg-white/10"
            >
              <Icon name="bag" className="size-6" />
            </button>
          </div>

          <div className="mt-8">
            <Button
              href="#collection"
              variant="invert"
              className="w-full"
              onClick={() => setMenuOpen(false)}
            >
              Show now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
