import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { faqs } from "@/content/copy";
import { site } from "@/lib/site";

/**
 * Native <details>/<summary>. Zero JavaScript, keyboard-accessible for free,
 * and every answer stays in the DOM so it is crawlable and matches the
 * FAQPage JSON-LD emitted in components/Schema.tsx.
 */
export default function Faq() {
  return (
    <Section id="faq" className="border-y border-line bg-parchment">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="Before you buy"
            title="The questions we actually get."
            body="If yours is not here, email us. A person answers, usually within a few hours."
          />
          <Reveal delay={0.2} className="mt-8 flex flex-col items-start gap-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 text-[0.82rem] font-medium text-volt transition-opacity hover:opacity-75"
            >
              {site.email}
            </a>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-[0.82rem] font-medium text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
            >
              See the full FAQ
            </Link>
          </Reveal>
        </div>

        <Stagger as="div" className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
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
                  <svg
                    viewBox="0 0 20 20"
                    className="h-full w-full"
                    fill="none"
                  >
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
                  <p className="max-w-[62ch] pb-7 text-[0.9rem] leading-[1.75] text-ink-soft text-pretty">
                    {f.a}
                  </p>
                </div>
              </div>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
