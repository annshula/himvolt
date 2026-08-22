import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { footerNav } from "@/content/copy";
import { site } from "@/lib/site";

const socials = [
  { label: "Instagram", href: site.socials.instagram },
  { label: "TikTok", href: site.socials.tiktok },
  { label: "X", href: site.socials.x },
  { label: "YouTube", href: site.socials.youtube },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-parchment px-5 pt-16 pb-10 sm:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <Wordmark className="text-[1.2rem]" />
            </div>
            <p className="font-display mt-5 text-[1.35rem] leading-none font-bold tracking-[-0.03em] text-ink-soft">
              {site.tagline}.
            </p>
            <p className="mt-5 max-w-[38ch] text-[0.82rem] leading-[1.7] text-ink-mute">
              One product, made properly. Free tracked shipping to every country
              we serve, and sixty days to send it back if it is not for you.
            </p>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    rel="me noopener noreferrer"
                    target="_blank"
                    className="text-[0.76rem] text-ink-soft transition-colors duration-300 hover:text-volt"
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
                <h2 className="text-[0.62rem] tracking-[0.26em] text-ink-mute uppercase">
                  {col.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[0.82rem] text-ink-soft transition-colors duration-300 hover:text-ink"
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

        <div className="mt-14 flex flex-col gap-5 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.72rem] text-ink-mute">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p className="max-w-[62ch] text-[0.68rem] leading-relaxed text-ink-mute/80">
            HimVolt sells jewellery. Nothing on this site is a medical device or
            a health claim, and black tourmaline is not a treatment for any
            condition.
          </p>
        </div>
      </div>
    </footer>
  );
}
