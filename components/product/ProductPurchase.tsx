"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import { ProductViewTracker } from "@/components/analytics/ProductViewTracker";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldIcon,
  StarIcon,
  WrenchIcon,
} from "@/components/ui/Icons";
import { RatingStars } from "@/components/ui/Stars";
import { quality } from "@/content/pitches";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/product";

/** A long merchant-supplied title needs a smaller ceiling than a short one — otherwise it wraps into a wall of oversized text at the default clamp's 2rem floor. Three fluid bands keyed to length, each still shrinking further on narrow viewports via its own clamp vw term. */
function titleSizeClass(title: string) {
  if (title.length > 90) return "text-[clamp(1.3rem,1rem+1.1vw,1.7rem)]";
  if (title.length > 55) return "text-[clamp(1.6rem,1.1rem+1.6vw,2.2rem)]";
  return "text-[clamp(2rem,1.3rem+2.4vw,3rem)]";
}

/**
 * Smooth-scroll the header's "4.7 · N reviews" pill to the very start of the
 * reviews section, clearing the sticky nav by a small breathing gap.
 *
 * A plain `#reviews` hash link is unreliable here: the Next client router
 * keeps a second, hidden copy of the section inside a <template>, and native
 * hash navigation can resolve to that inert copy (which has no layout box,
 * so nothing scrolls) or double-count scroll-padding + scroll-margin and
 * overshoot. Scrolling the rendered (visible) section by measured position
 * lands consistently every time.
 */
function scrollToReviewsSection(e: ReactMouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const target = Array.from(
    document.querySelectorAll<HTMLElement>("#reviews"),
  ).find((el) => el.getClientRects().length > 0);
  if (!target) return;
  const nav = document.querySelector<HTMLElement>("header");
  const navHeight = nav?.getBoundingClientRect().height ?? 68;
  const top =
    target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

/** Smooth-scroll a same-page anchor to an element id, clearing the sticky header. */
function scrollToId(e: ReactMouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;
  const nav = document.querySelector<HTMLElement>("header");
  const navHeight = nav?.getBoundingClientRect().height ?? 68;
  const top =
    target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

/**
 * One segment of the proof pill under the title.
 *
 * These used to be bare text links, which read as body copy rather than as
 * something to press. The pill's border and the fill-on-hover are the
 * affordance now, and the chevron slides in to telegraph "this jumps
 * somewhere" before the click lands. `min-h-11` holds a 44px touch target
 * even though the type is small, and the focus ring is pulled inside with a
 * negative offset because the parent pill clips overflow to keep its rounded
 * ends — without that, the global :focus-visible outline gets cut off.
 */
function ProofLink({
  targetId,
  label,
  icon,
  children,
}: {
  targetId: string;
  /** Spoken label — says where the jump lands, which the visible text alone doesn't. */
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      aria-label={label}
      onClick={(e) => scrollToId(e, targetId)}
      className="group flex min-h-11 touch-manipulation items-center gap-1.5 px-4 text-[0.8rem] font-medium text-ink-soft transition-colors duration-300 ease-(--ease-out-expo) hover:bg-ivory hover:text-ink focus-visible:-outline-offset-2 active:bg-parchment active:duration-100"
    >
      {icon}
      {children}
      <ChevronRightIcon className="h-3 w-3 shrink-0 -translate-x-1 text-ink-mute opacity-0 transition-all duration-300 ease-(--ease-out-expo) group-hover:translate-x-0 group-hover:opacity-100" />
    </a>
  );
}

/**
 * Gallery + buy box as one coordinated unit — both need to agree on which
 * variant is selected (picking a colour swatch in BuyBox should move
 * ProductGallery's main image to match it), so the selected variant id lives
 * here, one level above both, rather than duplicated as separate internal
 * state in each.
 */
export function ProductPurchase({
  product,
  rating,
  bestSeller = false,
}: {
  product: Product;
  /** Aggregate rating shown as a scroll-to-reviews link — only present when this product has a real review dataset (gated on verified data). */
  rating?: { average: number; count: number };
  /** Optional "Best seller" pill above the title — set only for the flagship bracelet. */
  bestSeller?: boolean;
}) {
  // Default to whichever variant carries the deepest real discount (a BOGO
  // or bundle deal) rather than always the first — that's the offer worth
  // leading with. Sold-out variants can't be ordered, so they're excluded
  // from the default unless every variant is sold out (then the picker still
  // has to show something). Falls back to the first variant when nothing is
  // discounted, so a plain single-SKU product is unaffected.
  const buyable = product.variants.filter((v) => v.availableForSale);
  const candidates = buyable.length > 0 ? buyable : product.variants;
  const bestDeal = candidates.reduce((best, v) => {
    const pct =
      v.compareAtPrice && v.compareAtPrice.amount > v.price.amount
        ? 1 - v.price.amount / v.compareAtPrice.amount
        : 0;
    const bestPct =
      best.compareAtPrice && best.compareAtPrice.amount > best.price.amount
        ? 1 - best.price.amount / best.compareAtPrice.amount
        : 0;
    return pct > bestPct ? v : best;
  }, candidates[0]);
  const [selectedId, setSelectedId] = useState(bestDeal.id);
  const selected =
    product.variants.find((v) => v.id === selectedId) ?? product.variants[0];

  // Description stays 3 lines until "Read more" expands it. The toggle only
  // renders when the text genuinely overflows the clamp (measured once, while
  // collapsed), so a short description never shows a pointless link.
  const descHtml = product.descriptionHtml.replace(/\s*—\s*/g, ", ").trim();
  const [descExpanded, setDescExpanded] = useState(false);
  const [descCanExpand, setDescCanExpand] = useState(false);
  const descRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      setDescCanExpand(el.scrollHeight > el.clientHeight + 1);
    });
    return () => cancelAnimationFrame(raf);
  }, [descHtml]);

  return (
    <div className="mx-auto grid w-full max-w-310 gap-12 px-5 pt-8 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-10 lg:pb-24">
      {/* Fired against the initially-selected variant (bestDeal), not the
          possibly-since-changed `selected` — one ViewContent per page view,
          matching what the shopper saw first, not every swatch/size click. */}
      <ProductViewTracker
        variantId={bestDeal.id}
        name={product.title}
        fallbackAmount={bestDeal.price.amount}
        fallbackCurrency={bestDeal.price.currencyCode}
      />
      <ProductGallery product={product} activeSrc={selected.image} />

      <div id="buy" className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="font-label flex items-center gap-2.5 text-[0.62rem] font-medium tracking-[0.24em] text-ink-mute uppercase">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-volt" />
              {product.material}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {bestSeller && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-volt px-3 py-1.5 text-[0.64rem] font-semibold tracking-[0.16em] text-on-accent uppercase">
                  <StarIcon className="h-3.5 w-3.5" filled />
                  Best seller
                </span>
              )}
              {rating && (
                <a
                  href="#reviews"
                  onClick={scrollToReviewsSection}
                  aria-label={`Rated ${rating.average.toFixed(1)} out of 5 by ${rating.count.toLocaleString("en-US")} customers. Read the reviews.`}
                  className="group inline-flex items-center gap-x-2.5 rounded-full border border-line bg-ivory py-1.5 pr-3.5 pl-2.5 transition-colors duration-200 hover:border-line-strong"
                >
                  <RatingStars value={rating.average} starClassName="h-3 w-3" />
                  <span className="text-[0.9rem] font-semibold text-ink tabular-nums">
                    {rating.average.toFixed(1)}
                  </span>
                  <span className="hidden text-[0.8rem] text-ink-mute sm:inline">
                    {rating.count.toLocaleString("en-US")} reviews
                  </span>
                  <ChevronDownIcon className="h-3.5 w-3.5 text-ink-mute transition-transform duration-200 group-hover:translate-y-0.5" />
                </a>
              )}
            </div>
          </div>

          <h1
            className={cn(
              "font-sans mt-5 leading-[1.18] font-semibold tracking-[-0.02em] text-ink text-balance",
              titleSizeClass(product.title),
            )}
          >
            {product.title}
          </h1>

          {/* Scroll guide to the build & QC sections further down the page,
              as one bordered pill rather than two bare text links so it
              reads as pressable at a glance. It carries the same border,
              fill and elevation tokens as the buy-box card right below it,
              so the two read as one family. The right segment states the
              real check count instead of a vague "quality tested" — the
              number comes from the QC list itself, so it can never drift
              from the section it jumps to. */}
          <div className="mt-4 inline-flex items-stretch overflow-hidden rounded-full border border-line bg-ivory/60 shadow-(--shadow-e1)">
            <ProofLink
              targetId="build"
              label="Jump to how this piece is built"
              icon={
                <WrenchIcon className="h-3.5 w-3.5 shrink-0 text-volt transition-colors duration-300 group-hover:text-ink" />
              }
            >
              Hand-built
            </ProofLink>
            <span aria-hidden className="w-px self-stretch bg-line" />
            <ProofLink
              targetId="quality-test"
              label={`Jump to the ${quality.checks.length} quality checks this piece passes`}
              icon={
                <ShieldIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 transition-colors duration-300 group-hover:text-ink" />
              }
            >
              {quality.checks.length} checks passed
            </ProofLink>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-(--radius-card) border border-line bg-ivory/60 p-4 shadow-(--shadow-e1) sm:p-5">
          <BuyBox
            product={product}
            selectedId={selectedId}
            onSelectId={setSelectedId}
          />
        </div>

        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[0.72rem] text-ink-mute">
          <span>Secure checkout · Shopify Payments</span>
          <span aria-hidden className="text-ink-soft/40">
            ·
          </span>
          <span>Card details never touch our servers</span>
          <span aria-hidden className="text-ink-soft/40">
            ·
          </span>
          <span>Tracked door-to-door</span>
        </p>

        {descHtml ? (
          <div className="mt-6">
            <div
              ref={descRef}
              className={cn(
                "max-w-[56ch] text-[0.9rem] leading-[1.65] text-ink-soft [&_p]:inline [&_p]:mt-0",
                !descExpanded && "line-clamp-3",
              )}
              dangerouslySetInnerHTML={{
                // Description HTML originates in the shared Shopify store and is
                // merchant-controlled, never end-user input. It's sanitized once,
                // at the trust boundary, in lib/sanitize-html.ts's
                // sanitizeProductHtml() — called from lib/shopify/sync-product.ts
                // before this ever reaches data/product.json. Re-sanitizing
                // already-clean local data here would just pull an HTML-parsing
                // library into the client bundle for no benefit — same trust
                // model as content/blog.ts's post bodies.
                __html: descHtml,
              }}
            />
            {descCanExpand && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                aria-expanded={descExpanded}
                className="group mt-2 inline-flex items-center gap-1.5 text-[0.76rem] font-semibold tracking-[0.08em] text-ink uppercase transition-colors duration-200 hover:text-volt"
              >
                {descExpanded ? "Show less" : "Read more"}
                <ChevronDownIcon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
                    descExpanded && "rotate-180",
                  )}
                />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
