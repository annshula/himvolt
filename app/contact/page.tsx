import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Icon } from "@/components/ui/Icons";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Motion";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "Contact";
const description = "Get in touch — a person replies, usually within 12 hours.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: `${title} · ${site.name}`,
    description,
    url: absoluteUrl("/contact"),
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
  },
};

export default function ContactPage() {
  return (
    <main>
      <Section className="pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <Reveal
              as="h1"
              delay={0.06}
              className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink text-balance"
            >
              Questions get answered by a person.
            </Reveal>
            <Reveal
              as="p"
              delay={0.14}
              className="mt-5 max-w-[46ch] text-[0.98rem] leading-[1.7] text-ink-soft text-pretty"
            >
              {site.promise.support}. Order questions, sizing, returns —
              whatever it is, use the form or email us directly.
            </Reveal>

            <Reveal delay={0.22} className="mt-9 flex flex-col gap-5">
              <a
                href={`mailto:${site.email}`}
                className="group flex items-center gap-3.5 rounded-(--radius-card) border border-line bg-linen p-5 transition-colors duration-300 hover:border-ink/20"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                  <Icon name="check" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] tracking-[0.2em] text-ink-mute uppercase">
                    Email
                  </span>
                  <span className="block truncate text-[0.95rem] font-medium text-ink group-hover:text-volt">
                    {site.email}
                  </span>
                </span>
              </a>

              <div className="flex items-center gap-3.5 rounded-(--radius-card) border border-line bg-linen p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-parchment text-ink-mute">
                  <Icon name="map-pin" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] tracking-[0.2em] text-ink-mute uppercase">
                    Address
                  </span>
                  <span className="block text-[0.95rem] font-medium text-ink">
                    {site.address}
                  </span>
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal
            delay={0.1}
            className="rounded-(--radius-card) border border-line bg-parchment p-6 sm:p-8"
          >
            <ContactForm />
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
