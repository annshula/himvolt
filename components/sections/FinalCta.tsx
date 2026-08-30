import Button from "@/components/ui/Button";
import { Magnetic, Reveal } from "@/components/ui/Motion";
import { finalCta } from "@/content/copy";

export default function FinalCta() {
  return (
    <section className="grain relative isolate overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-1/2 -z-10 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full opacity-45 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.03) 42%, transparent 68%)",
        }}
      />

      <div className="mx-auto max-w-216 text-center">
        <Reveal
          as="p"
          className="font-display text-[0.68rem] font-semibold tracking-[0.36em] text-volt uppercase"
        >
          {finalCta.eyebrow}
        </Reveal>

        <Reveal
          as="h2"
          delay={0.08}
          className="font-display mt-7 text-[clamp(2.4rem,6.4vw,4.6rem)] leading-[0.96] font-extrabold tracking-[-0.045em] text-balance"
        >
          {finalCta.headline}
        </Reveal>

        <Reveal
          as="p"
          delay={0.16}
          className="mx-auto mt-7 max-w-[42ch] text-[1rem] leading-[1.7] text-ink-soft text-pretty"
        >
          {finalCta.sub}
        </Reveal>

        <Reveal delay={0.24} className="mt-11 flex justify-center">
          <Magnetic>
            <Button href="/shop" arrow>
              {finalCta.cta}
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
