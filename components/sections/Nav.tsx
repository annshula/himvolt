"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ButtonHTMLAttributes } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { CurrencySelector } from "@/components/localization/CurrencySelector";
import { useCart } from "@/components/providers/CartProvider";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { easeOut, ScrollProgressBar } from "@/components/ui/Motion";
import { useScrollLock } from "@/lib/scroll-lock";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Benefits", href: "/benefits" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Shared look for every circular header icon — Track order, Account, Cart,
    the mobile trigger. No border: a plain circle that only picks up a tint
    on hover, so the cluster reads as one family instead of a mix of styles. */
export function iconButtonClass(solid: boolean, className = "") {
  return cn(
    "relative grid size-11 place-items-center rounded-full transition-colors duration-300",
    solid ? "text-ink hover:bg-ink/6" : "text-white hover:bg-white/12",
    className,
  );
}

function IconButton({
  solid,
  className = "",
  ...rest
}: {
  solid: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={iconButtonClass(solid, className)} {...rest} />
  );
}

function TrackOrderLink({ solid }: { solid: boolean }) {
  return (
    <a
      href="/track"
      aria-label="Track your order"
      title="Track your order"
      className={cn(iconButtonClass(solid), "hidden sm:grid")}
    >
      <Icon name="package" className="size-5" />
    </a>
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
          className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 font-display text-[0.6rem] font-semibold tracking-tight text-on-accent tabular-nums"
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
  // /benefits is dark top to bottom (every section is its own full-bleed
  // video/photo), not just a hero — so unlike home it never switches to the
  // light "solid" bar on scroll, it just stays transparent throughout.
  const isDarkThroughout = pathname === "/benefits";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: openCart } = useCart();
  useScrollLock(menuOpen);

  // The transparent-over-hero treatment applies to the home page's dark
  // video hero (until scrolled past it) and to /benefits (always). Every
  // other route is solid from first paint — otherwise white nav text would
  // render invisible over a light page.
  const solid = isDarkThroughout ? false : !isHome || scrolled;

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
        className={`sticky top-0 z-50 px-5 transition-all duration-500 ease-(--ease-out-expo) sm:px-8 ${
          solid ? "bg-canvas/85 backdrop-blur-xl" : "bg-transparent"
        }`}
        style={{ height: "var(--nav-h)" }}
      >
        <nav className="mx-auto flex h-full max-w-310 items-center justify-between gap-4 sm:gap-6">
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
            <TrackOrderLink solid={solid} />
            <span className="hidden sm:block">
              <AccountMenu variant="dropdown" overHero={!solid} />
            </span>
            <CartButton solid={solid} onOpen={() => setMenuOpen(false)} />
            <span className="ml-1 hidden sm:block">
              <Button
                href="/shop"
                size="md"
                variant={solid ? "volt" : "invert"}
              >
                Shop now
              </Button>
            </span>

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

        {/* Reading progress, spring-smoothed against real scroll velocity. */}
        <ScrollProgressBar className="absolute inset-x-0 bottom-0 h-0.75 bg-yellow-400" />
      </header>

      {/* ── Mobile drawer: full-screen panel that unfolds from the top, with
          the link list staggering in a beat behind it. ─────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-80 overflow-hidden bg-ink text-chalk lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: easeOut }}
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

              <motion.nav
                aria-label="Mobile"
                className="mt-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.15 },
                  },
                }}
              >
                <ul className="flex flex-col">
                  {links.map((l) => (
                    <motion.li
                      key={l.href}
                      className="border-b border-white/10"
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, ease: easeOut },
                        },
                      }}
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
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              <motion.div
                className="mt-auto flex flex-col gap-4 pt-6"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.32, ease: easeOut }}
              >
                {/* Currency, track order, account + sign-out, bag — reduced to
                    quiet centred icon buttons so the Shop CTA underneath
                    carries the weight. */}
                <div className="flex items-center justify-center gap-3">
                  <CurrencySelector variant="drawer" dark />
                  <a
                    href="/track"
                    aria-label="Track your order"
                    onClick={() => setMenuOpen(false)}
                    className={iconButtonClass(false)}
                  >
                    <Icon name="package" className="size-5" />
                  </a>
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
                  href="/shop"
                  variant="invert"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Shop now
                </Button>

                <p className="font-mega text-center text-2xl tracking-wide text-steel">
                  {site.tagline}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
