import Image from "next/image";
import Button from "@/components/ui/Button";
import Tilt from "@/components/ui/Tilt";
import { hero } from "@/content/copy";
import { site } from "@/lib/site";
import { product } from "@/lib/product";
// Decorative ambient canvas. Client component, so Next code-splits it out of
// the server payload; it renders an empty <canvas> until hydration.
import VoltField from "@/components/ui/VoltField";

const heroShot = product.gallery[1];

export default function Hero() {
  return (
    <section
      id="top"
      className="grain relative isolate flex min-h-[min(100svh,860px)] items-center overflow-hidden"
    >
      {/* ---------------------------- backdrop ---------------------------- */}

      {/* Volt bloom sitting directly behind the stone */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[6%] -z-10 h-[64vmax] w-[64vmax] -translate-y-1/2 rounded-full opacity-[0.42] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,91,56,0.55) 0%, rgba(214,60,28,0.16) 34%, transparent 66%)",
        }}
      />
      {/* Cold counter-light from the left keeps the coral from going orange-soup */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-18%] left-[-14%] -z-10 h-[52vmax] w-[52vmax] rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(120,150,200,0.30) 0%, transparent 62%)",
        }}
      />

      {/* Perspective floor grid */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[52vh] [perspective:620px]">
        <div
          className="absolute inset-0 origin-top opacity-[0.16] [transform:rotateX(74deg)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,210,225,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,210,225,0.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "linear-gradient(to bottom, black, transparent 72%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 72%)",
          }}
        />
      </div>

      <VoltField className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(8,9,12,0.72) 100%)",
        }}
      />

      {/* ----------------------------- content ---------------------------- */}

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-14 px-5 pt-16 pb-24 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pt-8 lg:pb-16">
        <div className="relative z-10">
          <p
            data-reveal
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.035] py-2 pr-4 pl-2.5 text-[0.63rem] font-medium tracking-[0.26em] text-ash uppercase backdrop-blur-sm"
          >
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-volt text-volt">
              <span className="pulse-ring absolute inset-0 rounded-full" />
            </span>
            {hero.eyebrow}
          </p>

          <h1
            data-reveal
            data-reveal-delay="1"
            className="font-display text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.92] font-extrabold tracking-[-0.045em]"
          >
            {hero.headline[0]}
            <br />
            <span className="relative inline-block">
              {hero.headline[1]}
              {/* the single coral glint in the type */}
              <span
                aria-hidden
                className="absolute -right-1 -bottom-1 h-[3px] w-[42%] rounded-full bg-gradient-to-r from-transparent via-volt to-transparent opacity-80"
              />
            </span>
          </h1>

          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-7 max-w-[46ch] text-[1.02rem] leading-[1.65] text-ash text-pretty"
          >
            {hero.sub}
          </p>

          <div data-reveal data-reveal-delay="3" className="mt-10 flex flex-wrap items-center gap-4">
            <Button href={hero.ctaHref} arrow>
              {hero.cta}
            </Button>
            <Button href={hero.secondaryHref} variant="ghost">
              {hero.secondary}
            </Button>
          </div>

          <p
            data-reveal
            data-reveal-delay="4"
            className="mt-8 text-[0.72rem] tracking-[0.06em] text-dim"
          >
            {site.promise.shipping} · {site.promise.returns} · Dispatched in 24h
          </p>
        </div>

        {/* --------------------------- the object -------------------------- */}

        <div className="relative flex items-center justify-center">
          <Tilt className="relative w-full max-w-[398px]" max={9}>
            {/* rotating dashed orbit */}
            <div
              aria-hidden
              className="spin-slow pointer-events-none absolute inset-[6%] rounded-full border border-dashed border-white/[0.09]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[18%] rounded-full border border-white/[0.05]"
            />

            {/* stone glow */}
            <div
              aria-hidden
              className="tilt__sheen pointer-events-none absolute inset-0 rounded-full"
            />

            <div className="tilt__layer relative z-0" style={{ ["--z" as string]: "60px" }}>
              <div className="float-slow">
                <Image
                  src={heroShot.src}
                  alt={heroShot.alt}
                  width={heroShot.width}
                  height={heroShot.height}
                  priority
                  quality={88}
                  sizes="(max-width: 1023px) 82vw, 440px"
                  className="relative mx-auto w-[78%] drop-shadow-[0_44px_60px_rgba(0,0,0,0.85)] lg:w-full"
                />

                {/* floor reflection */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-full -mt-[6%] h-[38%] scale-y-[-1] opacity-25"
                  style={{
                    maskImage: "linear-gradient(to top, transparent 4%, black 88%)",
                    WebkitMaskImage: "linear-gradient(to top, transparent 4%, black 88%)",
                  }}
                >
                  <Image
                    src={heroShot.src}
                    alt=""
                    aria-hidden
                    width={heroShot.width}
                    height={heroShot.height}
                    quality={88}
                    sizes="(max-width: 1023px) 82vw, 440px"
                    className="mx-auto w-[78%] blur-[2px] lg:w-full"
                  />
                </div>
              </div>
            </div>

            {/* spec pips floating in front of the object */}
            <SpecPip className="top-[12%] left-[-8%]" value="7–7.5" label="Mohs" delay="1" />
            <SpecPip className="top-[40%] right-[-11%]" value="40g" label="Weight" delay="2" />
            <SpecPip className="bottom-[14%] left-[-7%]" value="20cm" label="Relaxed" delay="3" />
          </Tilt>
        </div>
      </div>

      {/* scroll cue */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center lg:flex"
      >
        <div className="h-11 w-[22px] rounded-full border border-white/12 p-[5px]">
          <div className="h-2 w-full animate-bounce rounded-full bg-white/35" />
        </div>
      </div>
    </section>
  );
}

function SpecPip({
  className,
  value,
  label,
  delay,
}: {
  className: string;
  value: string;
  label: string;
  delay: string;
}) {
  // The translateZ layer and the reveal layer must be separate elements:
  // `[data-reveal="in"] { transform: none }` would otherwise win the cascade
  // and flatten the pip back to z=0, behind the stone.
  return (
    <div
      className={`tilt__layer absolute hidden sm:block ${className}`}
      style={{ ["--z" as string]: "180px" }}
    >
      <div
        data-reveal
        data-reveal-delay={delay}
        className="rounded-xl border border-white/[0.14] bg-graphite px-3.5 py-2.5 shadow-[0_16px_36px_-14px_rgba(0,0,0,0.95)]"
      >
        <div className="font-display text-[0.95rem] leading-none font-bold text-chalk">{value}</div>
        <div className="mt-1 text-[0.56rem] tracking-[0.2em] text-dim uppercase">{label}</div>
      </div>
    </div>
  );
}
