"use client";

import {
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import { ProductViewTracker } from "@/components/analytics/ProductViewTracker";
import { BuyBox } from "@/components/product/BuyBox";
import { DeliverySection } from "@/components/product/DeliverySection";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchaseFeedback } from "@/components/product/PurchaseFeedback";
import { Icon, type IconName } from "@/components/ui/Icons";
import Image from "@/components/ui/Image";
import { ChevronRightIcon } from "@/components/ui/Icons";
import { RatingStars } from "@/components/ui/Stars";
import { quality } from "@/content/pitches";
import type { ProductReview } from "@/data/reviews";
import type { Product } from "@/lib/product";
import type { PaymentMethod } from "@/lib/shopify/payments";
import { cn } from "@/lib/utils";

/**
 * Smooth-scroll the rating line to the very start of the reviews section,
 * clearing the sticky nav by a small breathing gap.
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
 * One quiet scroll-link. Plain text at rest — the hover underline plus the
 * chevron sliding in are the only affordance. `min-h-11` keeps a real 44px
 * touch target even though the visible text is small.
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
      className="group inline-flex min-h-11 touch-manipulation items-center gap-1.5 text-[0.8rem] font-medium text-ink-soft underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline focus-visible:underline"
    >
      {icon}
      {children}
      <ChevronRightIcon className="h-3 w-3 shrink-0 -translate-x-1 text-ink-mute opacity-0 transition-all duration-300 ease-(--ease-out-expo) group-hover:translate-x-0 group-hover:opacity-100" />
    </a>
  );
}

/** A short, plain description reads fine in an accordion; a supplier dump (image modules, spec tables, notes) doesn't. That content is covered by the specs and sections below instead. */
function cleanDescription(html: string): string | null {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text || text.length > 900 || /<(img|table|h1)\b/i.test(html)) return null;
  // scripts/sync-product.mjs writes Shopify's HTML as-is (only the API-route
  // sync sanitizes it), so refuse anything that could execute rather than
  // trust the file — such a description simply isn't shown in the accordion.
  if (/<(script|iframe|object|embed|style)\b|\son\w+\s*=|javascript:/i.test(html))
    return null;
  return html.replace(/\s*—\s*/g, ", ").trim();
}

/**
 * Faces beside the "N+ sold" figure — male profile photos, so the social proof
 * suits a men's line. Decorative only; the text next to them carries the label.
 */
/** 943 → "943", 1100 → "1.1K", 2000 → "2K", 1_250_000 → "1.2M". Rounds down, so "N+" never overstates. */
function compactCount(n: number): string {
  const trim = (x: number) => String(Math.floor(x * 10) / 10);
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return n.toLocaleString("en-US");
}

const BUYER_AVATARS = [
  "/avatars/jay.webp",
  "/avatars/matt.webp",
  "/avatars/tt-9d5f7c03.jpg",
  "/avatars/tt-bcd70b75.jpg",
] as const;

const SPEC_GROUP_TITLES = ["Performance", "Build & materials", "Use & fit"];

/**
 * Splits the specs, in Shopify's own order, into at most `max` evenly sized
 * groups (7 specs across 3 → 3 / 2 / 2) with a fixed title each. The first
 * specs a merchant lists are the headline ones, so they land in the first group.
 */
function groupSpecs(specs: Product["specs"], max: number) {
  const count = Math.min(max, specs.length, SPEC_GROUP_TITLES.length);
  if (count === 0) return [];
  const groups: { title: string; specs: Product["specs"] }[] = [];
  let start = 0;
  for (let i = 0; i < count; i++) {
    const size = Math.ceil((specs.length - start) / (count - i));
    groups.push({
      title: SPEC_GROUP_TITLES[i],
      specs: specs.slice(start, start + size),
    });
    start += size;
  }
  return groups;
}

/**
 * Keyword → icon for the perk list, checked in order against each perk's text
 * (case-insensitive) — first match wins. Perks come from the live Shopify
 * sync (`custom.perks`), so this can't be a fixed per-index mapping; a perk
 * that matches nothing falls back to the plain checkmark.
 */
const PERK_ICON_RULES: [pattern: RegExp, icon: IconName][] = [
  [/portable|fold|storage|carry|compact|travel/i, "package"],
  [/ship|delivery/i, "truck"],
  [/guarantee|warranty|return/i, "refresh"],
  [/safety|durable|build|structure|steel|frame|stable|hardness/i, "shield"],
  [/power|hydraulic|resistance|lbs?\b/i, "star"],
  [/count|display|lcd|size/i, "fit"],
];

function perkIcon(perk: string): IconName {
  return PERK_ICON_RULES.find(([pattern]) => pattern.test(perk))?.[1] ?? "check";
}

/**
 * Gallery + buy column as one coordinated unit — both need to agree on which
 * variant is selected (picking a colour card in BuyBox should move
 * ProductGallery's main image to match it), so the selected variant id lives
 * here, one level above both, rather than duplicated in each.
 *
 * The right-hand column is the reference PDP's section 1, top to bottom:
 * chips, rating, title, perks, the buying panel (option cards, free delivery
 * + offer timer, Add to bag, payment logos), accordion, delivery, and last
 * what other customers say.
 */
export function ProductPurchase({
  product,
  rating,
  ratingLinksToReviews = true,
  bestSeller = false,
  jewelry = false,
  feedback = [],
  payments = [],
}: {
  product: Product;
  /** Aggregate rating shown as a scroll-to-reviews link — only present when this product has a real review dataset (gated on verified data). */
  rating?: { average: number; count: number };
  /** Whether the rating line jumps to the reviews section — false when this product has no reviews section to land on (a rating from the custom.rating_* metafields alone). */
  ratingLinksToReviews?: boolean;
  /** Optional "Best seller" chip — set only for the flagship bracelet. */
  bestSeller?: boolean;
  /** Jewelry-only extras (the "Hand-built" / "checks passed" links). Off for any other kind of product. */
  jewelry?: boolean;
  /** The newest 5★ reviews for this product, already scoped to it — empty hides the strip. */
  feedback?: ProductReview[];
  /** Payment methods checkout accepts (from Shopify) — empty hides the logo row. */
  payments?: PaymentMethod[];
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

  const outOfStock = !selected.availableForSale;
  const lowStock = selected.lowStock;

  const description = cleanDescription(product.descriptionHtml);

  // Chips say something about the product itself — the highlights set in
  // Shopify's `custom.chips`, or its material when none are set. Stock is
  // only mentioned when it is a reason to act (low) or a blocker (out).
  const highlights =
    product.chips.length > 0
      ? product.chips
      : product.material
        ? [product.material]
        : [];
  const chips: { icon: IconName; text: string; tone?: "warn" | "bad" }[] = [
    ...(bestSeller ? [{ icon: "star" as const, text: "Best seller" }] : []),
    ...highlights.map((text) => ({ icon: "check" as const, text })),
    ...(outOfStock
      ? [{ icon: "alert" as const, text: "Out of stock", tone: "bad" as const }]
      : lowStock
        ? [
            {
              icon: "alert" as const,
              text: "Low stock, order soon",
              tone: "warn" as const,
            },
          ]
        : []),
  ];

  return (
    <div className="container-page pt-6 pb-10 md:pt-8 lg:pb-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        {/* Fired against the initially-selected variant (bestDeal), not the
            possibly-since-changed `selected` — one ViewContent per page view,
            matching what the shopper saw first, not every swatch click. */}
        <ProductViewTracker
          variantId={bestDeal.id}
          name={product.title}
          fallbackAmount={bestDeal.price.amount}
          fallbackCurrency={bestDeal.price.currencyCode}
        />
        <ProductGallery product={product} activeSrc={selected.image} />

        <div id="buy" className="min-w-0 scroll-mt-24 lg:pt-4">
          {/* ── Chips ───────────────────────────────────────────────── */}
          <ul className="mb-4 flex flex-wrap gap-2 font-ui sm:gap-1.5">
            {chips.map((chip) => (
              <li
                key={chip.text}
                className={cn(
                  "inline-flex min-w-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] leading-none font-medium sm:px-2.5 sm:text-[0.72rem]",
                  chip.tone === "bad"
                    ? "bg-error/10 text-error"
                    : chip.tone === "warn"
                      ? "bg-warning/10 text-warning"
                      : "bg-sage-100 text-sage-800",
                )}
              >
                <Icon
                  name={chip.icon}
                  className="size-4 shrink-0 sm:size-3.5"
                />
                <span>{chip.text}</span>
              </li>
            ))}
          </ul>

          {/* ── Rating + sold — custom.rating_* / custom.customers_* ── */}
          {(() => {
            const hasRating = rating != null && rating.count > 0;
            const sold = product.customersCount;
            const hasSold = sold != null && sold > 0;
            if (!hasRating && !hasSold) return null;

            const faces = (
              <span aria-hidden="true" className="flex shrink-0 items-center">
                {BUYER_AVATARS.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={32}
                    height={32}
                    className={cn(
                      "size-6 shrink-0 rounded-full object-cover ring-2 ring-canvas",
                      // Overlap with a left margin, not `space-x-*`: that puts
                      // a negative margin on every child but the last element
                      // in the DOM, and the last face is `display:none` on
                      // phones, so the third visible face would pull the sold
                      // count underneath it.
                      i > 0 && "-ml-2",
                      // Three faces is all a 320px line can hold.
                      i === BUYER_AVATARS.length - 1 && "hidden sm:block",
                    )}
                  />
                ))}
              </span>
            );

            const stars = hasRating && (
              <>
                <RatingStars
                  value={rating.average}
                  starClassName="h-3.5 w-3.5"
                />
                <span className="font-numeral font-semibold tabular-nums">
                  {rating.average.toFixed(1)}
                </span>
                <span
                  className={cn(
                    "text-ink-soft underline-offset-4",
                    ratingLinksToReviews &&
                      "underline decoration-ink-soft/40 group-hover:text-ink group-hover:decoration-current",
                  )}
                >
                  ({rating.count.toLocaleString("en-US")})
                </span>
              </>
            );
            const label = hasRating
              ? `Rated ${rating.average.toFixed(1)} out of 5 from ${rating.count.toLocaleString("en-US")} reviews`
              : "";

            return (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-ui text-body-sm">
                {!hasSold && faces}
                {hasRating &&
                  (ratingLinksToReviews ? (
                    <a
                      href="#reviews"
                      onClick={scrollToReviewsSection}
                      className="group inline-flex items-center gap-1.5"
                      aria-label={`${label} — jump to the reviews`}
                    >
                      {stars}
                    </a>
                  ) : (
                    <span
                      className="group inline-flex items-center gap-1.5"
                      aria-label={label}
                    >
                      {stars}
                    </span>
                  ))}
                {hasSold && (
                  <>
                    {hasRating && (
                      <span
                        aria-hidden="true"
                        className="hidden text-ink-mute sm:inline"
                      >
                        |
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-ink-soft">
                      {faces}
                      <span>
                        <span className="font-numeral font-bold text-ink tabular-nums">
                          {compactCount(sold)}+
                        </span>{" "}
                        sold
                        {product.customersMonths ? (
                          /* Shown on phones too: the sold group wraps onto its
                             own line under the rating when it doesn't fit.
                             Hidden only in the narrow lg buy-box column. */
                          <span className="lg:hidden xl:inline">
                            {" "}
                            in last {product.customersMonths} months
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </>
                )}
              </div>
            );
          })()}

          {/* ── Title ───────────────────────────────────────────────── */}
          <h1 className="mt-3 font-pdp-title text-[length:clamp(1.375rem,1.25rem+0.5vw,1.625rem)] leading-[1.15] font-medium text-wrap">
            {product.title}
          </h1>

          {jewelry && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.8rem]">
              <ProofLink
                targetId="build"
                label="Jump to how this piece is built"
                icon={
                  <Icon
                    name="wrench"
                    className="h-3.5 w-3.5 shrink-0 text-volt transition-colors duration-200 group-hover:text-ink"
                  />
                }
              >
                Hand-built
              </ProofLink>
              <span aria-hidden className="h-3.5 w-px bg-ink-soft/20" />
              <ProofLink
                targetId="quality-test"
                label={`Jump to the ${quality.checks.length} quality checks this piece passes`}
                icon={
                  <Icon
                    name="shield"
                    className="h-3.5 w-3.5 shrink-0 text-emerald-600 transition-colors duration-200 group-hover:text-ink"
                  />
                }
              >
                {quality.checks.length} checks passed
              </ProofLink>
            </p>
          )}

          {/* ── Perks (custom.perks in Shopify) ─────────────────────── */}
          {product.perks.length > 0 && (
            <ul className="mt-5 grid grid-cols-1 gap-y-2">
              {product.perks.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-2.5 text-body-sm"
                >
                  {/* items-start, not items-center: an icon centred on the
                      whole row drifts down whenever a perk wraps to two
                      lines. It belongs on the first line. */}
                  <span
                    aria-hidden="true"
                    className="mt-px grid size-5.5 shrink-0 place-items-center rounded-full bg-sage-600 text-white"
                  >
                    <Icon name={perkIcon(text)} className="size-3" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          )}

          {/* ── Buying panel ────────────────────────────────────────── */}
          <div className="mt-8">
            <BuyBox
              product={product}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              payments={payments}
            />
          </div>

          {/* ── Accordion ───────────────────────────────────────────── */}
          <ProductAccordion
            items={[
              ...(description
                ? [
                    {
                      title: "Description",
                      body: (
                        <div
                          className="[&_p]:mt-2 first:[&_p]:mt-0"
                          dangerouslySetInnerHTML={{
                            // Description HTML originates in the shared Shopify
                            // store and is merchant-controlled, never end-user
                            // input; cleanDescription() above also refuses
                            // anything executable before it gets here.
                            __html: description,
                          }}
                        />
                      ),
                    },
                  ]
                : []),
              // Shopify's `custom.specs`, grouped so the accordion stays at
              // three rows (like the reference): a short list reads better
              // than one row per spec. Shipping and returns are already in
              // the delivery box right below, so they aren't repeated here.
              ...groupSpecs(product.specs, description ? 2 : 3).map(
                (group) => ({
                  title: group.title,
                  body: (
                    <dl className="flex flex-col gap-3">
                      {group.specs.map((spec) => (
                        <div key={spec.label}>
                          <dt className="font-medium text-ink">
                            {spec.label}:{" "}
                            <span className="font-normal">{spec.value}</span>
                          </dt>
                          {spec.description && (
                            <dd className="mt-0.5">{spec.description}</dd>
                          )}
                        </div>
                      ))}
                    </dl>
                  ),
                }),
              ),
            ]}
          />

          {/* ── Delivery ────────────────────────────────────────────── */}
          <DeliverySection handle={product.handle} />

          {/* ── What customers say — the top 5★ reviews ─────────────── */}
          {feedback.length > 0 && (
            <PurchaseFeedback reviews={feedback} className="mt-5" />
          )}
        </div>
      </div>
    </div>
  );
}
