import Link from "next/link";

import Image from "@/components/ui/Image";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { ArrowIcon, CheckIcon } from "@/components/ui/Icons";
import { bracelet } from "@/content/product-bracelet";
import { pitchFor } from "@/content/pitches";
import { power } from "@/content/copy";
import { products, type Product } from "@/lib/product";
import { pathForHandle } from "@/lib/catalog";

/**
 * The collection, in two halves — physical (the arm trainer) and mental
 * (natural hematite) — then a short "best fit" picker. Links come from the
 * synced catalog, so the section follows whatever is live in Shopify: the arm
 * trainer is the first product that has no hematite pitch, the hematite side
 * is the flagship bracelet. The arm trainer's photo is its own first gallery
 * image; the hematite side uses the curated on-wrist shot from public/media,
 * because the bracelet's first product image is a promotional graphic.
 */
const MENTAL_COVER = {
  src: "/media/himvolt_worn.webp",
  alt: "Hematite bracelet worn on a wrist",
};
export default function Showcase() {
  const physical: Product | undefined = products.find(
    (p) => p.handle !== bracelet.handle && !pitchFor(p.handle),
  );
  const mental: Product | undefined =
    products.find((p) => p.handle === bracelet.handle) ??
    products.find((p) => Boolean(pitchFor(p.handle)));

  const productFor = { physical, mental } as const;
  const hrefFor = (key: "physical" | "mental" | "shop") =>
    key === "shop"
      ? "/shop"
      : productFor[key]
        ? pathForHandle(productFor[key]!.handle)
        : "/shop";

  return (
    <Section id="showcase" className="grain overflow-hidden">
      <SectionHeading
        align="center"
        eyebrow={power.eyebrow}
        title={power.headline}
        body={power.body}
      />

      {/* ----------------------------- the two sides ---------------------------- */}

      <Stagger className="mt-16 grid gap-6 lg:mt-20 lg:grid-cols-2">
        {power.sides.map((side) => {
          const product = productFor[side.key];
          const cover =
            side.key === "mental" ? MENTAL_COVER : product?.gallery[0];
          return (
            <StaggerItem
              key={side.key}
              as="article"
              className="group flex flex-col overflow-hidden rounded-(--radius-card) border border-line bg-linen"
            >
              <Link
                href={hrefFor(side.key)}
                aria-label={side.cta}
                className="relative block aspect-[5/4] overflow-hidden bg-parchment"
              >
                {cover && (
                  <Image
                    src={cover.src}
                    alt={cover.alt}
                    fill
                    sizes="(max-width: 1023px) 92vw, 600px"
                    className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.03]"
                  />
                )}
                <span className="absolute top-4 left-4 rounded-full bg-ink px-3 py-1.5 font-display text-[0.62rem] font-semibold tracking-[0.22em] text-white uppercase">
                  {side.eyebrow}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-7 lg:p-9">
                <h3 className="font-display text-[1.6rem] leading-[1.05] font-bold tracking-[-0.03em] text-ink">
                  {side.title}
                </h3>
                <p className="mt-4 text-[0.95rem] leading-[1.7] text-ink-soft text-pretty">
                  {side.body}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {side.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-[0.88rem] text-ink"
                    >
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-volt text-on-accent">
                        <CheckIcon className="size-3" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={hrefFor(side.key)}
                  className="mt-8 inline-flex items-center gap-2 self-start font-display text-[0.8rem] font-semibold tracking-[0.16em] text-ink uppercase underline-offset-[6px] hover:underline"
                >
                  {side.cta}
                  <ArrowIcon className="size-4" />
                </Link>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* ------------------------------- best fit ------------------------------- */}

      <div className="mt-20 lg:mt-28">
        <SectionHeading
          align="center"
          eyebrow={power.fit.eyebrow}
          title={power.fit.headline}
          body={power.fit.body}
        />

        <Stagger
          as="ul"
          className="mt-12 grid gap-px overflow-hidden rounded-(--radius-card) border border-line bg-line sm:grid-cols-3"
        >
          {power.fit.items.map((item, i) => (
            <StaggerItem
              key={item.need}
              as="li"
              className="group relative bg-linen transition-colors duration-500 hover:bg-ivory"
            >
              <Link
                href={hrefFor(item.target)}
                className="flex h-full flex-col p-7 lg:p-9"
              >
                <span className="font-display text-[0.68rem] tracking-[0.2em] text-volt/70 tabular-nums">
                  0{i + 1}
                </span>
                <p className="mt-4 text-[0.8rem] tracking-[0.04em] text-ink-mute">
                  {item.need}
                </p>
                <h3 className="font-display mt-2 text-[1.12rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
                  {item.pick}
                </h3>
                <p className="mt-3 text-[0.87rem] leading-[1.65] text-ink-soft">
                  {item.detail}
                </p>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px w-0 bg-linear-to-r from-volt to-transparent transition-all duration-700 ease-(--ease-out-expo) group-hover:w-full"
                />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-display text-[0.8rem] font-semibold tracking-[0.16em] text-ink uppercase underline-offset-[6px] hover:underline"
          >
            See the whole collection
            <ArrowIcon className="size-4" />
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
