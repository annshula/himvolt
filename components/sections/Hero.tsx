import Button from "@/components/ui/Button";
import { hero } from "@/content/copy";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="grain relative isolate -mt-[calc(var(--nav-h)+var(--marquee-h))] flex min-h-svh flex-col overflow-hidden bg-ink"
    >
      {/* --------------------------- backdrop ---------------------------- */}
      {/* Hero backdrop video — fills height & width, starts right at the
          top behind the navbar. Asset in public/videos/. */}
      <video
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/himvolt-hero.mp4"
      />

      {/* Black scrim over the footage so the white type always reads clearly */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[-5]"
        style={{
          background:
            "radial-gradient(95% 80% at 50% 45%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* ----------------------------- content ---------------------------- */}

      <div className="mx-auto flex w-full max-w-310 flex-1 flex-col items-center justify-center px-5 pt-20 pb-8 sm:px-8">
        <div className="relative z-10 mx-auto max-w-176 text-center">
          <p
            data-reveal
            className="mb-7 inline-flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-black/30 py-2 pr-4 pl-2.5 text-[0.63rem] font-medium tracking-[0.26em] text-chalk/90 uppercase backdrop-blur-sm"
          >
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-chalk text-chalk">
              <span className="pulse-ring absolute inset-0 rounded-full" />
            </span>
            {hero.eyebrow}
          </p>

          <h1
            data-reveal
            data-reveal-delay="1"
            className="font-mega text-[clamp(2.9rem,7.2vw,5.2rem)] leading-[0.88] text-chalk"
          >
            {hero.headline[0]}
            <br />
            <span className="relative inline-block">
              {hero.headline[1]}
              {/* the single white glint in the type */}
              <span
                aria-hidden
                className="absolute -right-1 -bottom-1 h-0.75 w-[42%] rounded-full bg-linear-to-r from-transparent via-chalk/60 to-transparent opacity-70"
              />
            </span>
          </h1>

          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-7 max-w-[46ch] text-[1.02rem] leading-[1.65] text-steel text-pretty"
          >
            {hero.sub}
          </p>

          <div
            data-reveal
            data-reveal-delay="3"
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button href={hero.ctaHref} arrow variant="invert">
              {hero.cta}
            </Button>
            <Button href={hero.secondaryHref} variant="ghost">
              {hero.secondary}
            </Button>
          </div>

          <p
            data-reveal
            data-reveal-delay="4"
            className="mt-8 text-[0.72rem] tracking-[0.06em] text-steel"
          >
            {site.promise.shipping} · {site.promise.returns} · Dispatched in 24h
          </p>
        </div>
      </div>
    </section>
  );
}
