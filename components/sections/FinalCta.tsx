import Image from "next/image";
import Button from "@/components/ui/Button";
import { finalCta } from "@/content/copy";
import { product } from "@/lib/product";

const flat = product.gallery[0];

export default function FinalCta() {
  return (
    <section className="grain relative isolate overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-1/2 -z-10 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full opacity-45 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,91,56,0.45) 0%, rgba(214,60,28,0.12) 40%, transparent 68%)",
        }}
      />

      {/* the stone, floating large and half out of frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-14%] -z-10 mx-auto max-w-[820px] opacity-[0.22]"
      >
        <Image
          src={flat.src}
          alt=""
          width={flat.width}
          height={flat.height}
          quality={55}
          sizes="100vw"
          className="float-slow w-full"
        />
      </div>

      <div className="mx-auto max-w-[54rem] text-center">
        <p
          data-reveal
          className="font-display text-[0.68rem] font-semibold tracking-[0.36em] text-volt uppercase"
        >
          {finalCta.eyebrow}
        </p>

        <h2
          data-reveal
          data-reveal-delay="1"
          className="font-display mt-7 text-[clamp(2.4rem,6.4vw,4.6rem)] leading-[0.96] font-extrabold tracking-[-0.045em] text-balance"
        >
          {finalCta.headline}
        </h2>

        <p
          data-reveal
          data-reveal-delay="2"
          className="mx-auto mt-7 max-w-[42ch] text-[1rem] leading-[1.7] text-ink-soft text-pretty"
        >
          {finalCta.sub}
        </p>

        <div
          data-reveal
          data-reveal-delay="3"
          className="mt-11 flex justify-center"
        >
          <Button href="#collection" arrow>
            {finalCta.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
