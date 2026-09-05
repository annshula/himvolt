import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { EraExplorer } from "@/components/product/EraExplorer";
import { bracelet } from "@/content/product-bracelet";
import { sources, type StoryContent } from "@/content/pitches";
import type { Product } from "@/lib/product";

/**
 * The emotional engine of the hematite pages: a full-bleed dark band right
 * after the buy box that sells the *why* before a spec has a chance to.
 *
 * Instead of a static photo, the right column is an interactive "era
 * explorer" (components/product/EraExplorer.tsx): a story the shopper can
 * scrub through, each chapter with its own real product image. Every fact in
 * the copy is a real mineral property or history/tradition framed as such,
 * nothing here claims a physiological outcome.
 */
export default function BraceletStory({
  product,
  story,
}: {
  product: Product;
  /** Story copy — pass a per-product pitch (content/pitches.ts) or default to the flagship bracelet copy. */
  story?: StoryContent;
}) {
  const s = story ?? bracelet.story;

  // Spread real product photos across the chapters so each era gets its own
  // visual (not one repeated still). Safe even if the gallery is short.
  const pool = product.gallery;
  const eraImages = s.eras.map((_, idx) => {
    if (pool.length === 0) return { src: "", alt: "" };
    const slot =
      pool.length === 1
        ? 0
        : Math.round(
            (idx / Math.max(s.eras.length - 1, 1)) * (pool.length - 1),
          );
    const img = pool[Math.min(slot, pool.length - 1)];
    return { src: img.src, alt: img.alt };
  });

  return (
    <section
      aria-label="Hematite, five thousand years of tradition"
      className="relative overflow-hidden bg-ink text-white"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 font-mono text-[clamp(1.4rem,4.6vw,3.6rem)] whitespace-nowrap text-white/5 select-none"
      >
        Fe₂O₃ · iron(III) oxide · Fe₂O₃
      </span>

      <div className="relative mx-auto w-full max-w-310 px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div>
            <Reveal
              as="p"
              className="flex items-center gap-3 text-[0.63rem] font-medium tracking-[0.28em] text-volt uppercase"
            >
              <span aria-hidden className="h-px w-7 bg-volt/50" />
              {s.eyebrow}
            </Reveal>
            <Reveal
              as="h2"
              delay={0.06}
              className="mt-5 font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.06] font-semibold tracking-[-0.02em] text-balance"
            >
              {s.heading}
            </Reveal>
            <Reveal
              as="p"
              delay={0.14}
              className="mt-7 max-w-[46ch] border-l-2 border-volt/60 pl-6 text-[1.02rem] leading-[1.7] text-white/70 text-pretty"
            >
              {s.lede}
            </Reveal>
            {s.claim && (
              <Reveal
                as="p"
                delay={0.2}
                className="font-display mt-6 max-w-[34ch] text-[1.18rem] leading-snug font-semibold tracking-[-0.01em] text-volt"
              >
                {s.claim}
              </Reveal>
            )}

            <Stagger
              as="div"
              className="mt-10 grid grid-cols-3 gap-4 sm:gap-6"
              stagger={0.08}
            >
              {s.stats.map((st) => (
                <StaggerItem
                  key={st.value}
                  as="div"
                  className="border-l border-white/15 pl-4"
                >
                  <span className="font-display block text-[clamp(1.25rem,2.2vw,1.7rem)] leading-none font-semibold tracking-[-0.01em] text-white tabular-nums">
                    {st.value}
                  </span>
                  <span className="mt-2 block text-[0.7rem] leading-normal text-white/50">
                    {st.label}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.18} className="block">
            <EraExplorer eras={s.eras} images={eraImages} />
          </Reveal>
        </div>

        <p className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[0.7rem] text-white/40">
          <span className="font-label tracking-[0.18em] uppercase">
            Sources
          </span>
          {sources.map((src, i) => (
            <span key={src.href} className="inline-flex items-center gap-2.5">
              {i > 0 && (
                <span aria-hidden className="text-white/20">
                  /
                </span>
              )}
              <a
                href={src.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline decoration-white/25 underline-offset-2 transition-colors hover:text-white/90"
              >
                {src.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
