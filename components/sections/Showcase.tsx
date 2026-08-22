import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/Section";
import Tilt from "@/components/ui/Tilt";
import { showcase } from "@/content/copy";
import { product } from "@/lib/product";

const flat = product.gallery[0];
const worn = product.gallery[2];

/**
 * The product, shot large. Every image here is a real cutout on the dark
 * canvas — the white studio background was keyed out at build time
 * (`scripts/cutout.mjs`) so the stone sits in the page rather than on a card.
 */
export default function Showcase() {
  return (
    <Section id="showcase" className="grain overflow-hidden">
      <SectionHeading
        align="center"
        eyebrow={showcase.eyebrow}
        title={showcase.headline}
        body={showcase.body}
      />

      {/* ------------------------- the hero object ------------------------- */}

      <div className="relative mt-16 lg:mt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-[46vmax] w-[46vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 42%, transparent 68%)",
          }}
        />

        <Tilt className="scroll-scale relative mx-auto max-w-[720px]" max={7}>
          <div className="tilt__layer" style={{ ["--z" as string]: "50px" }}>
            <Image
              src={flat.src}
              alt={flat.alt}
              width={flat.width}
              height={flat.height}
              quality={90}
              sizes="(max-width: 1023px) 92vw, 720px"
              className="w-full drop-shadow-[0_44px_56px_rgba(70,52,28,0.30)]"
            />
          </div>
          <div
            aria-hidden
            className="tilt__sheen pointer-events-none absolute inset-0 rounded-[50%]"
          />
        </Tilt>

        {/* measurement callout drawn over the stone */}
        <div
          data-reveal
          className="pointer-events-none mx-auto mt-10 hidden max-w-[720px] items-center gap-4 px-8 sm:flex"
        >
          <span
            aria-hidden
            className="h-px flex-1 bg-linear-to-r from-transparent to-line"
          />
          <span className="text-[0.62rem] tracking-[0.28em] text-ink-mute uppercase">
            20 cm relaxed · fits 16–21 cm
          </span>
          <span
            aria-hidden
            className="h-px flex-1 bg-linear-to-l from-transparent to-line"
          />
        </div>
      </div>

      {/* ----------------------------- the points ---------------------------- */}

      <div className="mt-20 grid gap-px overflow-hidden rounded-(--radius-card) border border-line bg-line sm:grid-cols-3 lg:mt-28">
        {showcase.points.map((p, i) => (
          <article
            key={p.title}
            data-reveal
            data-reveal-delay={String(i + 1)}
            className="group relative bg-linen p-7 transition-colors duration-500 hover:bg-ivory lg:p-9"
          >
            <span className="font-display text-[0.68rem] tracking-[0.2em] text-volt/70 tabular-nums">
              0{i + 1}
            </span>
            <h3 className="font-display mt-4 text-[1.12rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
              {p.title}
            </h3>
            <p className="mt-3 text-[0.87rem] leading-[1.65] text-ink-soft">
              {p.body}
            </p>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px w-0 bg-gradient-to-r from-volt to-transparent transition-all duration-700 ease-(--ease-out-expo) group-hover:w-full"
            />
          </article>
        ))}
      </div>

      {/* ---------------------- worn + spec sheet ---------------------- */}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <figure
          data-reveal
          className="relative overflow-hidden rounded-(--radius-card) border border-line"
        >
          <Image
            src={worn.src}
            alt={worn.alt}
            width={worn.width}
            height={worn.height}
            quality={82}
            sizes="(max-width: 1023px) 92vw, 660px"
            className="parallax h-full min-h-[300px] w-full scale-105 object-cover object-[center_58%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent"
          />
          <figcaption className="absolute inset-x-0 bottom-0 p-7">
            <p className="font-display text-[1rem] font-semibold tracking-[-0.02em] text-chalk">
              Worn, not displayed.
            </p>
            <p className="mt-1.5 max-w-[34ch] text-[0.8rem] leading-snug text-steel/70">
              It sits flat against the wrist bone and slides under a shirt cuff
              without catching.
            </p>
          </figcaption>
        </figure>

        <div
          data-reveal
          data-reveal-delay="1"
          className="rounded-(--radius-card) border border-line bg-linen p-7 lg:p-9"
        >
          <h3 className="text-[0.62rem] tracking-[0.28em] text-ink-mute uppercase">
            Specification
          </h3>
          <dl className="mt-6 divide-y divide-line">
            {product.specs.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-6 py-3"
              >
                <dt className="shrink-0 text-[0.78rem] text-ink-mute">
                  {s.label}
                </dt>
                <dd className="text-right text-[0.82rem] font-medium text-ink-soft">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[0.72rem] leading-relaxed text-ink-mute">
            Every band is measured and weighed before it ships. If yours is out
            of tolerance, we replace it before you have to ask.
          </p>
        </div>
      </div>
    </Section>
  );
}
