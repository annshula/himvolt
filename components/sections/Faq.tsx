import { Section, SectionHeading } from "@/components/ui/Section";
import { faqs } from "@/content/copy";
import { site } from "@/lib/site";

/**
 * Native <details>/<summary>. Zero JavaScript, keyboard-accessible for free,
 * and every answer stays in the DOM so it is crawlable and matches the
 * FAQPage JSON-LD emitted in components/Schema.tsx.
 */
export default function Faq() {
  return (
    <Section id="faq" className="border-y border-white/[0.07] bg-pitch">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="Before you buy"
            title="The questions we actually get."
            body="If yours is not here, email us. A person answers, usually within a few hours."
          />
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-flex items-center gap-2 text-[0.82rem] font-medium text-volt transition-opacity hover:opacity-75"
          >
            {site.email}
          </a>
        </div>

        <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="faq-item group"
              data-reveal
              data-reveal-delay={String(Math.min(i + 1, 5))}
            >
              <summary className="flex items-start justify-between gap-6 py-6 transition-colors duration-300 hover:text-volt">
                <h3 className="font-display text-[1.02rem] leading-snug font-semibold tracking-[-0.02em] text-chalk transition-colors duration-300 group-hover:text-volt">
                  {f.q}
                </h3>
                <span
                  aria-hidden
                  className="faq-sign mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-dim"
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
                  <p className="max-w-[62ch] pb-7 text-[0.9rem] leading-[1.75] text-ash text-pretty">
                    {f.a}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
