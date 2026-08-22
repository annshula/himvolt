import type { Metadata } from "next";

import { ParallaxBenefit } from "@/components/benefits/ParallaxBenefit";
import { ScrollSnapRoot } from "@/components/benefits/ScrollSnapRoot";
import Button from "@/components/ui/Button";
import { Magnetic, Reveal, ScrollProgressBar } from "@/components/ui/Motion";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "Benefits";
const description =
  "Real black tourmaline, a fit that disappears, a stone harder than the knife in your pocket. What the band actually does, one reason at a time.";

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
        url: absoluteUrl("/media/current.jpg"),
        width: 2000,
        height: 1116,
        alt: `${site.name} — black tourmaline bracelet`,
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
    body: "Natural black tourmaline, not dyed glass, not resin cast to look the part. Every band is cut from the same rough, so what you feel under a loupe is what you feel on your wrist.",
    align: "left" as const,
    media: {
      kind: "image" as const,
      src: "/media/macro.jpg",
      alt: "Extreme close-up of a single square-cut black tourmaline stone",
    },
  },
  {
    index: "02",
    eyebrow: "The physics",
    title: "The stone that makes its own charge.",
    body: "Tourmaline is one of a short list of minerals that is both pyroelectric and piezoelectric. Warm it, or squeeze it, and it develops a measurable electrical polarity across its axis — a real, documented property of the rock, not a metaphor.",
    align: "right" as const,
    media: {
      kind: "video" as const,
      poster: "/media/hero-wide-1920.jpg",
      sources: [
        { src: "/media/hero-portrait-sm.mp4", type: "video/mp4", media: "(max-width: 640px)" },
        { src: "/media/hero.webm", type: "video/webm" },
        { src: "/media/hero.mp4", type: "video/mp4" },
      ],
    },
  },
  {
    index: "03",
    eyebrow: "The fit",
    title: "No clasp to fail.",
    body: "A double-corded elastic core runs the full circumference — roll it on, forget it is there. 20cm relaxed, stretches clean to a 21cm wrist, no sizing chart and no returns for fit.",
    align: "left" as const,
    media: {
      kind: "video" as const,
      poster: "/media/wear.jpg",
      sources: [
        { src: "/media/wear-sm.mp4", type: "video/mp4", media: "(max-width: 640px)" },
        { src: "/media/wear.webm", type: "video/webm" },
        { src: "/media/wear.mp4", type: "video/mp4" },
      ],
    },
  },
  {
    index: "04",
    eyebrow: "The hardness",
    title: "Harder than the knife in your pocket.",
    body: "Tourmaline sits at 7–7.5 on the Mohs scale. Steel sits at 5.5. It will outlast the wrist it is on — the same reason it survives a gym, a shower and a bad habit of never taking it off.",
    align: "right" as const,
    media: {
      kind: "image" as const,
      src: "/media/origin.jpg",
      alt: "Raw black tourmaline crystal beside the finished bracelet on dark rock",
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
      <ScrollProgressBar className="fixed inset-x-0 top-0 z-40 h-px origin-left bg-linear-to-r from-volt via-volt-hot to-volt" />

      {/* ------------------------------- intro -------------------------------- */}
      <section className="grain relative isolate flex h-svh snap-start flex-col items-center justify-center overflow-hidden bg-pitch px-5 text-center sm:px-8">
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          poster="/media/current.jpg"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source media="(max-width: 640px)" src="/media/current-sm.mp4" type="video/mp4" />
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
            Not a mood board. The material, the physics, the fit and the
            hardness — scroll through what you are actually buying.
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
            Free tracked shipping worldwide. 30 days to change your mind.
          </p>
          <div className="mt-9 flex justify-center">
            <Magnetic>
              <Button href="/products/the-tourmaline-band" arrow variant="invert">
                Shop the band
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
