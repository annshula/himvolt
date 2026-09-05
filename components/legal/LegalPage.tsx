import Link from "next/link";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { AlertIcon } from "@/components/ui/Icons";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Motion";
import { getLegalPage } from "@/content/legal";
import { site } from "@/lib/site";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Shared renderer for every legal/compliance page (content/legal.ts). One
 * template, one place to fix the layout — the documents differ only in
 * their data. The merchant-review notice only renders outside production so
 * it never reads as part of the actual policy to a visitor.
 */
export function LegalPage({ slug }: { slug: string }) {
  const page = getLegalPage(slug);
  if (!page) return null;

  return (
    <main>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: page.title, path: `/${page.slug}` },
        ]}
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
            <span className="text-ink-soft">{page.title}</span>
          </nav>

          <Eyebrow>Legal</Eyebrow>
          <Reveal
            as="h1"
            delay={0.06}
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink text-balance"
          >
            {page.title}
          </Reveal>
          <Reveal
            as="p"
            delay={0.12}
            className="mt-4 text-[0.95rem] leading-[1.6] text-ink-soft"
          >
            {page.description}
          </Reveal>
          <p className="mt-2 text-[0.72rem] tracking-[0.04em] text-ink-mute">
            Last updated {formatDate(page.lastUpdated)}
          </p>

          {page.requiresMerchantReview &&
            process.env.NODE_ENV !== "production" && (
              <div className="mt-8 flex gap-3 rounded-(--radius-card) border border-line bg-parchment p-5">
                <span className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-mute">
                  <AlertIcon />
                </span>
                <p className="text-[0.82rem] leading-[1.6] text-ink-soft">
                  <strong className="text-ink">Review before launch.</strong>{" "}
                  This page describes how the storefront actually behaves — real
                  analytics, real return terms, real fulfillment partner — but
                  it is not legal advice. Have it reviewed before relying on it
                  in a dispute. Edit the source in{" "}
                  <code className="rounded-xs bg-linen px-1 py-0.5 text-[0.78rem]">
                    content/legal.ts
                  </code>
                  . This notice is hidden in production.
                </p>
              </div>
            )}

          <div className="mt-10 space-y-9">
            {page.sections.map((section, index) => (
              <section key={section.heading ?? `section-${index}`}>
                {section.heading && (
                  <h2 className="font-display mb-3 text-[1.1rem] font-bold tracking-[-0.02em] text-ink">
                    {section.heading}
                  </h2>
                )}
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[0.92rem] leading-[1.75] text-ink-soft"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-(--radius-card) border border-line bg-linen p-6">
            <p className="text-[0.88rem] leading-[1.6] text-ink-soft">
              Questions about this page? Email{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-volt underline underline-offset-2"
              >
                {site.email}
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
