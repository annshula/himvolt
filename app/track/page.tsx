import type { Metadata } from "next";

import { TrackOrderForm } from "@/components/track/TrackOrderForm";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Motion";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "Track your order";
const description = "Enter your order or tracking number to see where it is.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/track" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title: `${title} · ${site.name}`,
    description,
    url: absoluteUrl("/track"),
    siteName: site.name,
  },
};

export default function TrackPage() {
  return (
    <main>
      <Section className="pt-20 lg:pt-28">
        <div className="mx-auto max-w-160">
          <Eyebrow>Where's my order</Eyebrow>
          <Reveal
            as="h1"
            delay={0.06}
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink text-balance"
          >
            Track your shipment.
          </Reveal>
          <Reveal
            as="p"
            delay={0.14}
            className="mt-4 text-[0.98rem] leading-[1.7] text-ink-soft text-pretty"
          >
            Paste the order number from your confirmation email, or the tracking
            number from your shipping email — either works.
          </Reveal>

          <Reveal delay={0.22} className="mt-10">
            <TrackOrderForm />
          </Reveal>

          <p className="mt-8 text-center text-[0.8rem] text-ink-mute">
            Signed in? Your full order history is in{" "}
            <a
              href="/account/orders"
              className="text-volt underline underline-offset-4"
            >
              your account
            </a>
            .
          </p>
        </div>
      </Section>
    </main>
  );
}
