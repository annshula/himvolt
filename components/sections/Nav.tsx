"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { marqueeWords } from "@/content/copy";

const links = [
  { label: "The band", href: "#showcase" },
  { label: "The stone", href: "#stone" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement marquee — pure CSS, duplicated once for a seamless loop */}
      <div className="marquee relative z-50 overflow-hidden border-b border-white/[0.06] bg-carbon/80 py-2">
        <div className="marquee-track gap-10" style={{ ["--dur" as string]: "38s" }}>
          {[0, 1].map((pass) => (
            <div key={pass} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={pass === 1}>
              {marqueeWords.map((w) => (
                <span
                  key={w}
                  className="flex shrink-0 items-center gap-3 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-ash"
                >
                  <span className="h-1 w-1 rounded-full bg-volt" />
                  {w}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-[var(--ease-out-expo)] ${
          solid
            ? "border-b border-white/[0.07] bg-void/72 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
        style={{ height: "var(--nav-h)" }}
      >
        <nav className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
          <Logo />

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative text-[0.78rem] font-medium tracking-[0.02em] text-ash transition-colors duration-300 hover:text-chalk"
                >
                  {l.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-volt transition-all duration-400 ease-[var(--ease-out-expo)] group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <span className="hidden sm:block">
            <Button href="#collection" size="md" arrow>
              Shop
            </Button>
          </span>
          <a
            href="#collection"
            className="font-display text-[0.78rem] font-semibold tracking-[0.16em] text-volt uppercase sm:hidden"
          >
            Shop
          </a>
        </nav>

        {/* Reading progress. Scroll-driven where supported, invisible otherwise. */}
        <div
          aria-hidden
          className="scroll-progress absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-volt-deep via-volt to-volt-hot"
        />
      </header>
    </>
  );
}
