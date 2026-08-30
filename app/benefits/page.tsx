import type { Metadata } from "next";

import { ParallaxBenefit } from "@/components/benefits/ParallaxBenefit";
import { ScrollSnapRoot } from "@/components/benefits/ScrollSnapRoot";
import Button from "@/components/ui/Button";
import { Magnetic, Reveal } from "@/components/ui/Motion";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "Benefits";
const description =
  "Real hematite, a fit that disappears, a stone that matches the steel in your pocket. What the collection actually gives you, one reason at a time.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/benefits" },
  openGraph: {
    type: "website",
    title: `${title} · ${site.name}`,
    description,
    url: absoluteUrl("/benefits"),
    siteName: site.name,
    images: [
      {
        url: absoluteUrl("/media/current.webp"),
        width: 2000,
        height: 1116,
        alt: `${site.name} — hematite bracelet`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
  },
};

const benefits = [
  {
    index: "01",
    eyebrow: "The material",
    title: "Real stone, not resin.",
    body: "Natural hematite, not dyed glass, not resin cast to look the part. Every piece is cut from the same mineral, so what you feel under a loupe is what you feel on your wrist.",
    align: "left" as const,
    media: {
      kind: "image" as const,
      src: "/media/macro.webp",
      alt: "Extreme close-up of a single polished hematite bead",
    },
  },
  {
    index: "02",
    eyebrow: "The origin",
    title: "The stone the ancients called blood.",
    body: 'Hematite gets its name from the Greek for "blood-like stone." Scratch its metallic black surface and it leaves a real, deep red-brown streak — the same iron oxide that gives the stone its name, its weight, and a five-thousand-year history of being picked up and carried.',
    align: "right" as const,
    media: {
      kind: "video" as const,
      poster: "/media/hero-wide-1920.webp",
      sources: [
        {
          src: "/media/hero-portrait-sm.mp4",
          type: "video/mp4",
          media: "(max-width: 640px)",
        },
        { src: "/media/hero.webm", type: "video/webm" },
        { src: "/media/hero.mp4", type: "video/mp4" },
      ],
    },
  },
  {
    index: "03",
    eyebrow: "The fit",
    title: "No clasp to fail.",
    body: "A stretch elastic core runs the full circumference — roll it on, forget it is there. No sizing chart, no returns for fit.",
    align: "left" as const,
    media: {
      kind: "video" as const,
      poster: "/media/wear.webp",
      sources: [
        {
          src: "/media/wear-sm.mp4",
          type: "video/mp4",
          media: "(max-width: 640px)",
        },
        { src: "/media/wear.webm", type: "video/webm" },
        { src: "/media/wear.mp4", type: "video/mp4" },
      ],
    },
  },
  {
    index: "04",
    eyebrow: "The hardness",
    title: "Level with the steel in your pocket.",
    body: "Hematite sits at 5.5–6.5 on the Mohs scale — matching hardened steel. It holds up to a gym, a shower and years of never taking it off, though a hard direct knock can still chip it, same as any polished stone.",
    align: "right" as const,
    media: {
      kind: "image" as const,
      src: "/media/origin.webp",
      alt: "Raw hematite ore beside a finished polished bracelet on dark rock",
    },
  },
];

/**
 * A single long scroll built entirely from the brand's own footage — no
 * stock, no illustration. Each reason the band exists gets one full screen
 * and one parallax shot; the copy is the same claims made on the home page,
 * just given room to breathe.
 */
export default function BenefitsPage() {
  return (
    <main className="bg-pitch">
      <ScrollSnapRoot />

      {/* ------------------------------- intro -------------------------------- */}
      {/* Negative top margin pulls this section up under the sticky nav's own
          box (same trick Hero.tsx uses on home) — otherwise the transparent
          header has nothing dark behind it at scroll 0 and just shows the
          page's own white background through. Height is padded out by the
          same amount so the section still ends exactly one viewport below
          where it would have started without the margin — get this wrong
          and every section after it lands nav-height short in the scroll-
          snap grid, not just this one. */}
      <section className="grain relative isolate -mt-[calc(var(--nav-h)+var(--marquee-h))] flex h-[calc(100svh+var(--nav-h)+var(--marquee-h))] snap-start flex-col items-center justify-center overflow-hidden bg-pitch px-5 text-center sm:px-8">
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          poster="/poster/stone"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source
            media="(max-width: 640px)"
            src="/media/current-sm.mp4"
            type="video/mp4"
          />
          <source src="/media/current.webm" type="video/webm" />
          <source src="/media/current.mp4" type="video/mp4" />
        </video>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-black/55 via-black/35 to-black/70"
        />

        <Reveal>
          <p className="font-display text-[0.72rem] font-semibold tracking-[0.32em] text-volt uppercase">
            Four reasons, no filler
          </p>
          <h1 className="font-mega mt-6 text-[clamp(2.6rem,7vw,4.8rem)] leading-[0.92] text-chalk">
            What the stone
            <br />
            actually does.
          </h1>
          <p className="mx-auto mt-7 max-w-[46ch] text-[1.02rem] leading-[1.65] text-steel text-pretty">
            Not a mood board. The material, the origin, the fit and the hardness
            — scroll through what you are actually buying.
          </p>
        </Reveal>
      </section>

      {/* ------------------------------ benefits ------------------------------ */}
      {benefits.map((b) => (
        <ParallaxBenefit key={b.index} {...b} />
      ))}

      {/* -------------------------------- close -------------------------------- */}
      <section className="grain relative isolate flex h-svh snap-start flex-col items-center justify-center overflow-hidden bg-pitch px-5 text-center sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 50%, rgba(198,134,63,0.16) 0%, rgba(198,134,63,0.04) 45%, transparent 72%)",
          }}
        />
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold tracking-[-0.03em] text-chalk text-balance">
            Convinced, or just curious — either way, go look at it.
          </h2>
          <p className="mx-auto mt-5 max-w-[42ch] text-[1rem] leading-[1.65] text-steel text-pretty">
            {site.promise.shipping}. {site.promise.returns}.
          </p>
          <div className="mt-9 flex justify-center">
            <Magnetic>
              <Button href="/shop" arrow variant="invert">
                Shop the collection
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
