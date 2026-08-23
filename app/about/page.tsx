import type { Metadata } from "next";

import { Section, SectionHeading, Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { stone } from "@/content/copy";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
import { shipping, daysRange, type ShippingRegion } from "@/lib/shipping";

const title = "About";

const shippingGroups: [string, ShippingRegion[]][] = Object.entries(
  shipping.regions.reduce<Record<string, ShippingRegion[]>>((acc, region) => {
    (acc[region.group] ??= []).push(region);
    return acc;
  }, {}),
);
const description = `${site.description} One product, made properly — no catalog to pad, nothing to upsell.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: `${title} · ${site.name}`,
    description,
    url: absoluteUrl("/about"),
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
  },
};

export default function AboutPage() {
  return (
    <main>
      <Section className="pt-20 lg:pt-28">
        <div className="mx-auto max-w-184 text-center">
          <Eyebrow>Who we are</Eyebrow>
          <Reveal
            as="h1"
            delay={0.06}
            className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink text-balance"
          >
            A small collection, made properly.
          </Reveal>
          <Reveal
            as="p"
            delay={0.14}
            className="mt-6 text-[1.02rem] leading-[1.7] text-ink-soft text-pretty"
          >
            {site.description} No sprawling catalog to get lost in — five
            pieces, cut from real hematite, sold honestly.
          </Reveal>
        </div>
      </Section>

      <Section className="border-y border-line bg-parchment">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Eyebrow>{stone.eyebrow}</Eyebrow>
            <Reveal
              as="h2"
              delay={0.06}
              className="font-display text-[clamp(2rem,4.2vw,3.1rem)] leading-[1.02] font-bold tracking-[-0.04em] text-ink text-balance"
            >
              {stone.headline}
            </Reveal>
            <Reveal
              delay={0.14}
              className="mt-8 border-l-2 border-volt/60 pl-6"
            >
              <p className="text-[1rem] leading-[1.7] text-ink-soft text-pretty">
                {stone.lede}
              </p>
            </Reveal>
          </div>

          <Stagger className="space-y-px overflow-hidden rounded-(--radius-card) border border-line bg-line">
            {stone.paragraphs.map((p, i) => (
              <StaggerItem
                key={p.title}
                as="article"
                className="bg-linen p-7 lg:p-10"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-[0.66rem] tracking-[0.2em] text-ink-mute tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[1.15rem] leading-tight font-semibold tracking-tight text-ink">
                    {p.title}
                  </h3>
                </div>
                <p className="mt-4 pl-[1.6600000000000001rem] text-[0.9rem] leading-[1.72] text-ink-soft text-pretty">
                  {p.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="center"
          eyebrow="How we operate"
          title="What we promise, and what we won't."
          body="No sizing consultants, no seasonal drops, no hundred-item catalog to get lost in. Five pieces, priced honestly, backed by people who actually answer email."
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-3">
          <StaggerItem
            as="article"
            className="rounded-(--radius-card) border border-line bg-linen p-7"
          >
            <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
              {site.promise.shipping}
            </h3>
            <p className="mt-2.5 text-[0.86rem] leading-[1.65] text-ink-soft">
              {site.promise.shippingFull}
            </p>
          </StaggerItem>
          <StaggerItem
            as="article"
            className="rounded-(--radius-card) border border-line bg-linen p-7"
          >
            <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
              {site.promise.returns}
            </h3>
            <p className="mt-2.5 text-[0.86rem] leading-[1.65] text-ink-soft">
              {site.promise.returnsDetail}
            </p>
          </StaggerItem>
          <StaggerItem
            as="article"
            className="rounded-(--radius-card) border border-line bg-linen p-7"
          >
            <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
              {site.promise.support}
            </h3>
            <p className="mt-2.5 text-[0.86rem] leading-[1.65] text-ink-soft">
              Email{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-volt underline underline-offset-4"
              >
                {site.email}
              </a>{" "}
              and a person answers — not a bot, not a ticket queue.
            </p>
          </StaggerItem>
        </Stagger>
      </Section>

      <Section className="border-t border-line bg-parchment">
        <SectionHeading
          align="center"
          eyebrow="Shipping, honestly"
          title="Shipping timelines by region."
          body="Every order ships tracked and free, on the fastest reliable route for where you are. Figures below reflect live carrier data."
        />

        <Stagger className="mt-14 space-y-10">
          {shippingGroups.map(([group, regions]) => (
            <StaggerItem key={group} as="div">
              <h3 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-ink-mute uppercase">
                {group}
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                {regions.map((region) => (
                  <article
                    key={region.code}
                    className="rounded-(--radius-card) border border-line bg-linen p-7 text-center"
                  >
                    <h4 className="font-display text-[0.95rem] font-semibold tracking-[-0.01em] text-ink">
                      {region.label}
                    </h4>
                    <p className="mt-4 font-display text-[1.8rem] font-bold tracking-[-0.03em] text-ink tabular-nums">
                      {daysRange(region)}
                    </p>
                    <p className="mt-1 text-[0.78rem] text-ink-mute">
                      business days
                    </p>
                  </article>
                ))}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mx-auto mt-8 max-w-160 text-center text-[0.76rem] leading-relaxed text-ink-mute">
          Tracked delivery, free on every order — no minimum, no upsell for
          speed. Shipping to a country not listed here typically falls within
          these same ranges; estimates update as carrier performance changes.
        </p>
      </Section>
    </main>
  );
}
