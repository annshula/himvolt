"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/components/providers/CartProvider";
import {
  useLocalization,
  type LocalizedPrice,
} from "@/components/providers/LocalizationProvider";
import Image from "@/components/ui/Image";
import { Icon } from "@/components/ui/Icons";
import { RatingStars } from "@/components/ui/Stars";
import { bumpProduct, bumpVariant } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

/** The add-on's rating as the merchant supplied it (5 stars from 472 ratings). Keep it equal to the real ratings the product has. */
const BUMP_RATING = { average: 5, count: 472 };

/**
 * The bag's one-click add-on ("cart bump"): the product synced into
 * data/bump.json, offered under the bag lines until it is in the bag. Name,
 * photo and price are Shopify's own; the price is the live one for the
 * shopper's country (the same overlay the bag lines use), held behind a
 * placeholder until it lands so a base-currency figure never flashes.
 *
 * Priced on its own request that names the bag's other lines: a product limited
 * to some countries pins the whole bag to a country it ships to (and so to that
 * country's currency), and the add-on has to follow or the bag would mix two
 * currencies.
 */
export function BagBump() {
  const { lines, add } = useCart();
  const { ready, country, defaultCountry } = useLocalization();
  const effectiveCountry = country ?? defaultCountry?.isoCode ?? null;
  const canLocalize = effectiveCountry !== null;

  const variantId = bumpVariant?.id;
  const bagKey = lines
    .map((l) => l.variantId)
    .filter((id) => id !== variantId)
    .join(",");
  const hasLines = lines.length > 0;

  const [fetched, setFetched] = useState<{
    key: string;
    price: LocalizedPrice | null;
  } | null>(null);
  const fetchKey = `${effectiveCountry}|${bagKey}`;

  useEffect(() => {
    if (!variantId || !hasLines || !effectiveCountry) return;
    let cancelled = false;
    fetch("/api/localization/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantIds: [variantId],
        bagVariantIds: bagKey ? bagKey.split(",") : [],
        country: effectiveCountry,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setFetched({ key: fetchKey, price: data.prices?.[variantId] ?? null });
        }
      })
      // Settle either way: a failed fetch falls back to the base price.
      .catch(() => {
        if (!cancelled) setFetched({ key: fetchKey, price: null });
      });
    return () => {
      cancelled = true;
    };
  }, [variantId, hasLines, effectiveCountry, bagKey, fetchKey]);

  const settled = fetched?.key === fetchKey;
  const live = settled ? fetched.price : null;

  if (!bumpVariant || variantId === undefined) return null;
  if (lines.length === 0) return null;
  if (lines.some((l) => l.variantId === variantId)) return null;

  const liveAmount = live ? Number.parseFloat(live.amount) : NaN;
  const amount = Number.isFinite(liveAmount) ? liveAmount : bumpVariant.price;
  const currency = live?.currencyCode ?? bumpProduct.currencyCode ?? "USD";
  // Only ever a real markdown: the compare-at above the price, never equal to it.
  const compareRaw = live
    ? live.compareAtAmount != null
      ? Number.parseFloat(live.compareAtAmount)
      : null
    : bumpVariant.compareAtPrice;
  const compareAt =
    compareRaw != null && Number.isFinite(compareRaw) && compareRaw > amount
      ? compareRaw
      : null;
  const saved = compareAt != null ? Math.round((compareAt - amount) * 100) / 100 : null;
  const pending = !ready || (canLocalize && !settled);
  const image = bumpVariant.image ?? bumpProduct.images?.[0]?.src ?? "";

  return (
    <div className="mx-3 mb-1 rounded-card border border-dashed border-sage-300 bg-sage-50 p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-ui text-[0.68rem] font-semibold tracking-widest text-sage-800 uppercase">
          Add to your order
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-clay-600 px-2 py-1 font-ui text-[0.62rem] leading-none font-semibold tracking-wide text-white uppercase">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-3"
          >
            <polyline points="3 17 9 11 13 15 21 7" />
            <polyline points="15 7 21 7 21 13" />
          </svg>
          Trending
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="well relative size-14 shrink-0 overflow-hidden rounded-xl">
          {image && (
            <Image
              src={image}
              alt=""
              fill
              sizes="56px"
              className="object-contain mix-blend-multiply"
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            title={bumpProduct.title}
            className="line-clamp-2 text-[0.78rem] leading-snug font-medium"
          >
            {bumpProduct.title}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-ink-soft">
            <RatingStars value={BUMP_RATING.average} starClassName="h-3 w-3" />
            <span className="font-numeral tabular-nums">
              {BUMP_RATING.average.toFixed(1)} ({BUMP_RATING.count} ratings)
            </span>
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-numeral tabular-nums">
            {pending ? (
              <span
                aria-hidden="true"
                className="skeleton inline-block h-[0.95em] w-[3.4em] rounded-md align-[-0.12em] text-[0.8125rem]"
              />
            ) : (
              <>
                <span className="text-[0.9375rem] font-semibold">
                  {formatMoney(amount, currency)}
                </span>
                {compareAt != null && (
                  <span className="text-[0.72rem] text-ink-faint line-through decoration-1">
                    {formatMoney(compareAt, currency)}
                  </span>
                )}
                {saved != null && saved > 0 && (
                  <span className="inline-flex h-[18px] items-center rounded-tag bg-sage-800 px-1.5 pt-px text-[0.68rem] leading-none font-medium text-white">
                    Save {formatMoney(saved, currency)}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            add(variantId, 1, Math.round(amount * 100), currency)
          }
          className="inline-flex shrink-0 items-center gap-1 rounded-tag bg-sage-800 px-3 py-2 font-ui text-[0.78rem] leading-none font-semibold text-white transition-colors hover:bg-sage-600 disabled:opacity-50"
          aria-label={`Add ${bumpProduct.title} to your bag`}
        >
          <Icon name="plus" className="size-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}
