"use client";

import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { Reveal } from "@/components/ui/Motion";
import { footerNav } from "@/content/copy";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const socials = [
  { label: "Instagram", href: site.socials.instagram },
  { label: "TikTok", href: site.socials.tiktok },
  { label: "Facebook", href: site.socials.facebook },
  { label: "YouTube", href: site.socials.youtube },
];

/**
 * The one other deliberately dark surface, along with the hero and the
 * drawers — everything in between stays on the light canvas. Uses the
 * always-dark tokens (pitch/chalk/steel/ash), not the flippable ink/line
 * pair the rest of the site reads off, so it can't ever end up light.
 *
 * /benefits is the one exception: that page is dark top to bottom, so a
 * dark footer would just vanish into it with no seam. Flipped white there,
 * on purpose, so the page has a visible landing point.
 */
export default function Footer() {
  const pathname = usePathname();
  const light = pathname === "/benefits";

  return (
    <footer
      className={cn(
        "border-t px-5 pt-16 pb-10 sm:px-8",
        light
          ? "border-line bg-white text-ink"
          : "border-white/10 bg-pitch text-chalk",
      )}
    >
      <Reveal as="div" className="mx-auto max-w-310" y={16}>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark
                variant={light ? "black" : "white"}
                className="h-8 w-8"
              />
              <Wordmark className="text-[1.2rem]" />
            </div>
            <p
              className={cn(
                "font-display mt-5 text-[1.35rem] leading-none font-bold tracking-[-0.03em]",
                light ? "text-ink-soft" : "text-steel",
              )}
            >
              {site.tagline}.
            </p>
            <p
              className={cn(
                "mt-5 max-w-[38ch] text-[0.82rem] leading-[1.7]",
                light ? "text-ink-mute" : "text-ash",
              )}
            >
              A small collection, made properly. {site.promise.shipping}, and{" "}
              {site.promise.returns.charAt(0).toLowerCase() + site.promise.returns.slice(1)}.
            </p>

            <NewsletterForm light={light} />

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    rel="me noopener noreferrer"
                    target="_blank"
                    className={cn(
                      "text-[0.76rem] transition-colors duration-300 hover:text-volt",
                      light ? "text-ink-soft" : "text-steel",
                    )}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav
            aria-label="Footer"
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
          >
            {footerNav.map((col) => (
              <div key={col.title}>
                <h2
                  className={cn(
                    "text-[0.62rem] tracking-[0.26em] uppercase",
                    light ? "text-ink-mute" : "text-ash",
                  )}
                >
                  {col.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className={cn(
                          "text-[0.82rem] transition-colors duration-300",
                          light
                            ? "text-ink-soft hover:text-ink"
                            : "text-steel hover:text-chalk",
                        )}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div
          className={cn(
            "mt-14 flex flex-col gap-5 border-t pt-7 sm:flex-row sm:items-center sm:justify-between",
            light ? "border-line" : "border-white/10",
          )}
        >
          <p
            className={cn(
              "text-[0.72rem]",
              light ? "text-ink-mute" : "text-ash",
            )}
          >
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p
            className={cn(
              "max-w-[62ch] text-[0.68rem] leading-relaxed",
              light ? "text-ink-mute/80" : "text-ash/70",
            )}
          >
            HimVolt sells jewellery. Nothing on this site is a medical device or
            a health claim, and hematite is not a treatment for any condition.
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
