"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ButtonHTMLAttributes } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { CurrencySelector } from "@/components/localization/CurrencySelector";
import { useCart } from "@/components/providers/CartProvider";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { useScrollLock } from "@/lib/scroll-lock";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { label: "Shop", href: "/#collection" },
  { label: "The band", href: "/#showcase" },
  { label: "The stone", href: "/#stone" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
];

function IconButton({
  solid,
  className = "",
  ...rest
}: {
  solid: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "relative grid size-11 place-items-center rounded-full border transition-colors duration-300",
        solid
          ? "border-ink/15 text-ink hover:border-ink hover:bg-ink/[0.03]"
          : "border-white/25 text-white hover:border-white/70 hover:bg-white/10",
        className,
      )}
      {...rest}
    />
  );
}

function CartButton({
  solid,
  onOpen,
}: {
  solid: boolean;
  onOpen?: () => void;
}) {
  const { count, open } = useCart();
  return (
    <IconButton
      solid={solid}
      onClick={() => {
        onOpen?.();
        open();
      }}
      aria-label={`Open shopping bag${count > 0 ? ` (${count} items)` : ""}`}
    >
      <Icon name="bag" className="size-5" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 font-display text-[0.6rem] font-semibold tracking-tight text-white tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </IconButton>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: openCart } = useCart();
  useScrollLock(menuOpen);

  // The transparent-over-hero treatment only ever applies to the home
  // page's dark video hero. Every other route is solid from first paint —
  // otherwise white nav text would render invisible over a light page.
  const solid = !isHome || scrolled;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-(--ease-out-expo) ${
          solid ? "bg-canvas/85 backdrop-blur-xl" : "bg-transparent"
        }`}
        style={{ height: "var(--nav-h)" }}
      >
        <nav className="mx-auto flex h-full max-w-310 items-center justify-between gap-4 px-5 sm:gap-6 sm:px-8">
          <Logo className={solid ? "text-ink" : "text-chalk"} />

          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`font-label group relative text-[0.72rem] font-medium tracking-[0.2em] uppercase transition-colors duration-300 ${
                    solid
                      ? "text-ink-soft hover:text-ink"
                      : "text-chalk/90 hover:text-white"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px w-0 transition-all duration-400 ease-(--ease-out-expo) group-hover:w-full ${
                      solid ? "bg-ink" : "bg-chalk"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-end gap-2 sm:gap-2.5">
            <span className="hidden lg:block">
              <CurrencySelector variant="bar" overHero={!solid} />
            </span>
            <span className="ml-1 hidden sm:block">
              <Button
                href="/#collection"
                size="md"
                variant={solid ? "volt" : "invert"}
              >
                Shop now
              </Button>
            </span>
            <span className="hidden sm:block">
              <AccountMenu variant="dropdown" overHero={!solid} />
            </span>
            <CartButton solid={solid} onOpen={() => setMenuOpen(false)} />

            {/* Mobile menu trigger */}
            <IconButton
              solid={solid}
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
        </nav>

        {/* Reading progress. Scroll-driven where supported, invisible otherwise. */}
        <div
          aria-hidden
          className={`scroll-progress absolute inset-x-0 bottom-0 h-px origin-left bg-linear-to-r ${
            solid
              ? "from-ink via-ink to-ink"
              : "from-chalk/70 via-chalk to-chalk/70"
          }`}
        />
      </header>

      {/* ── Mobile drawer: full-screen panel, mirrors the reference build's
          clip-path reveal — done in pure CSS since the site carries no
          animation library. ─────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "fixed inset-0 z-80 overflow-hidden bg-ink text-chalk transition-[clip-path] duration-600 ease-(--ease-out-expo) lg:hidden",
          menuOpen
            ? "[clip-path:inset(0_0_0%_0)]"
            : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        inert={!menuOpen}
      >
        <div className="grain hv-backdrop pointer-events-none absolute inset-0" />

        <div className="relative flex h-full flex-col px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <div className="flex items-center justify-between">
            <Logo className="text-chalk" />
            <IconButton
              solid={false}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <Icon name="close" className="size-4" />
            </IconButton>
          </div>

          <nav
            aria-label="Mobile"
            className="mt-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
          >
            <ul className="flex flex-col">
              {links.map((l, i) => (
                <li
                  key={l.href}
                  className={cn(
                    "border-b border-white/10 transition-all duration-400 ease-(--ease-out-expo)",
                    menuOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-3 opacity-0",
                  )}
                  style={{ transitionDelay: menuOpen ? `${i * 45 + 120}ms` : "0ms" }}
                >
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-label group flex items-center justify-between gap-4 py-4 text-[0.92rem] tracking-[0.22em] text-chalk/90 uppercase transition-colors duration-300 hover:text-white active:text-white"
                  >
                    {l.label}
                    <Icon
                      name="arrow-right"
                      className="size-4 -translate-x-1 text-white/40 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white/80"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className={cn(
              "mt-auto flex flex-col gap-4 pt-6 transition-all duration-400 ease-(--ease-out-expo)",
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
            style={{ transitionDelay: menuOpen ? "260ms" : "0ms" }}
          >
            {/* Currency, account + sign-out, bag — reduced to quiet centred
                icon buttons so the Shop CTA underneath carries the weight. */}
            <div className="flex items-center justify-center gap-3">
              <CurrencySelector variant="drawer" dark />
              <AccountMenu variant="list" dark />
              <IconButton
                solid={false}
                onClick={() => {
                  setMenuOpen(false);
                  openCart();
                }}
                aria-label="Open shopping bag"
              >
                <Icon name="bag" className="size-5" />
              </IconButton>
            </div>

            <Button
              href="/#collection"
              variant="invert"
              className="w-full"
              onClick={() => setMenuOpen(false)}
            >
              Shop now
            </Button>

            <p className="font-mega text-center text-2xl tracking-wide text-steel">
              {site.tagline}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
