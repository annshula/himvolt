import type { Metadata } from "next";
import Link from "next/link";

import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { allFaqs, faqGroups } from "@/content/faq";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "FAQ";
const description =
  "Every question we actually get about hematite, sizing, shipping and returns — mineral fact kept separate from tradition, the same way it is everywhere else on this site.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    title: `${title} · ${site.name}`,
    description,
    url: absoluteUrl("/faq"),
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
  },
};

export default function FaqPage() {
  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        // Author-controlled HTML (a couple of answers link out) — never
        // user input, same trust model as blog post bodies.
        text: f.a.replace(/<[^>]+>/g, ""),
      },
    })),
  };

  return (
    <main>
      <BreadcrumbSchema items={[{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <Section className="pt-20 lg:pt-28">
        <div className="mx-auto max-w-165">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] text-ink-mute"
          >
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-soft">FAQ</span>
          </nav>

          <Eyebrow>Before you buy</Eyebrow>
          <Reveal
            as="h1"
            delay={0.06}
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink text-balance"
          >
            Every question we actually get.
          </Reveal>
          <Reveal
            as="p"
            delay={0.12}
            className="mt-5 max-w-[52ch] text-[0.98rem] leading-[1.7] text-ink-soft text-pretty"
          >
            {description} If yours is not here, email{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-medium text-volt underline underline-offset-2"
            >
              {site.email}
            </a>{" "}
            — a person answers, usually within a few hours.
          </Reveal>

          <div className="mt-12 space-y-12">
            {faqGroups.map((group) => (
              <section key={group.title}>
                <h2 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-ink-mute uppercase">
                  {group.title}
                </h2>
                <Stagger as="div" className="mt-4 divide-y divide-line border-y border-line">
                  {group.items.map((f) => (
                    <StaggerItem key={f.q} as="div">
                      <details className="faq-item group">
                        <summary className="flex items-start justify-between gap-6 py-6 transition-colors duration-300 hover:text-volt">
                          <h3 className="font-display text-[1.02rem] leading-snug font-semibold tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-volt">
                            {f.q}
                          </h3>
                          <span
                            aria-hidden
                            className="faq-sign mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-ink-mute"
                          >
                            <svg viewBox="0 0 20 20" className="h-full w-full" fill="none">
                              <path
                                d="M10 4v12M4 10h12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="faq-body">
                          <div>
                            <p
                              className="max-w-[64ch] pb-7 text-[0.9rem] leading-[1.75] text-ink-soft text-pretty [&_a]:text-volt [&_a]:underline [&_a]:underline-offset-4"
                              // Author-controlled HTML (a couple of answers link
                              // to a blog post or product page) — never user input.
                              dangerouslySetInnerHTML={{ __html: f.a }}
                            />
                          </div>
                        </div>
                      </details>
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
