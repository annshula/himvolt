"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/providers/CartProvider";
import { useLocalization } from "@/components/providers/LocalizationProvider";
import Image from "@/components/ui/Image";
import { Icon } from "@/components/ui/Icons";
import { PaymentIcons } from "@/components/ui/PaymentIcons";
import { productCurrency } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { shopifyCheckout } from "@/lib/shopify-checkout";
import type { PaymentMethod } from "@/lib/shopify/payments";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const MAX_QTY = 10;

/**
 * Bag body shared by the drawer and the /checkout page: lines, totals,
 * checkout. `onNavigate` closes the drawer when a link is followed.
 *
 * Prices are Shopify's own answer for the shopper's country (the same live
 * overlay the product page uses), and checkout is created for that same
 * country, so the total here is the total Shopify charges. Until every line's
 * live price has landed the amounts are held behind a placeholder — adding a
 * base-currency line to a localized one would put two currencies in one total.
 */
export function BagContents({
  payments,
  onNavigate,
}: {
  payments: PaymentMethod[];
  onNavigate?: () => void;
}) {
  const { lines, hydrated, setQty, remove } = useCart();
  const { ready, canLocalize, requestPrices, localizedPriceFor, isPriceSettled } =
    useLocalization();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The summary starts as a compact total + checkout; the arrow opens the
  // shipping and discount breakdown.
  const [detailsOpen, setDetailsOpen] = useState(false);

  const idKey = lines.map((l) => l.variantId).join(",");
  const ids = useMemo(() => (idKey ? idKey.split(",") : []), [idKey]);
  useEffect(() => {
    if (ids.length > 0) requestPrices(ids);
  }, [ids, requestPrices]);

  const allLanded =
    ids.length > 0 && ids.every((id) => localizedPriceFor(id) != null);
  const pricePending =
    ids.length > 0 &&
    (!ready || (canLocalize && !allLanded && !ids.every((id) => isPriceSettled(id))));

  const round = (n: number) => Math.round(n * 100) / 100;

  const priced = useMemo(
    () =>
      lines.map((line) => {
        const live = allLanded ? localizedPriceFor(line.variantId) : null;
        const liveAmount = live ? Number.parseFloat(live.amount) : NaN;
        const unit = Number.isFinite(liveAmount)
          ? liveAmount
          : line.unitPriceCents / 100;
        const liveCompare =
          live?.compareAtAmount != null
            ? Number.parseFloat(live.compareAtAmount)
            : NaN;
        const compareAtUnit = live
          ? Number.isFinite(liveCompare)
            ? liveCompare
            : null
          : line.compareAtCents != null
            ? line.compareAtCents / 100
            : null;
        const hasDiscount = compareAtUnit != null && compareAtUnit > unit;
        return {
          ...line,
          lineTotal: round(unit * line.qty),
          compareAtTotal: round((hasDiscount ? compareAtUnit : unit) * line.qty),
          // The line's saving as an amount: compare-at total less what is paid.
          savedAmount: hasDiscount
            ? round((compareAtUnit - unit) * line.qty)
            : null,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, allLanded, localizedPriceFor],
  );

  // Shopify localizes every line into one currency together, so the first
  // live line's currency speaks for the whole bag.
  const currency =
    (allLanded
      ? ids.map((id) => localizedPriceFor(id)?.currencyCode).find(Boolean)
      : undefined) ?? productCurrency;

  const subtotal = round(priced.reduce((s, l) => s + l.lineTotal, 0));
  const discount = round(
    priced.reduce((s, l) => s + l.compareAtTotal, 0) - subtotal,
  );

  const money = (amount: number) =>
    pricePending ? (
      <span
        aria-hidden="true"
        className="inline-block h-3.5 w-14 animate-pulse rounded-full bg-sand align-middle"
      />
    ) : (
      formatMoney(amount, currency)
    );

  if (!hydrated) {
    return (
      <div className="flex-1 p-6 text-body-sm text-ink-soft">
        Loading your bag…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-start gap-5 p-6">
        <p className="font-serif text-heading-sm">Your bag is empty.</p>
        <p className="text-body-sm text-ink-soft">
          Pick something from the collection and it will show up here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="btn-primary" onClick={onNavigate}>
            Shop the collection
          </Link>
          <Link href="/about" className="btn-quiet" onClick={onNavigate}>
            About HimVolt
          </Link>
        </div>
      </div>
    );
  }

  const onCheckout = async () => {
    setPending(true);
    setError(null);
    const result = await shopifyCheckout(
      priced.map((l) => ({
        variantId: l.variantId,
        qty: l.qty,
        priceCents: Math.round((l.lineTotal / l.qty) * 100),
      })),
      currency,
    );
    if (result.ok) {
      window.location.assign(result.checkoutUrl);
      return;
    }
    setError(result.error);
    setPending(false);
  };

  return (
    <>
      <ul
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-3 py-2"
        aria-label="Items in your bag"
      >
        {priced.map((line) => {
          const hasSaving = line.savedAmount != null;
          /* Packs are chosen on the product page, so these lines have no
             quantity stepper. */
          const fixedPack = line.hasPackOption;
          const removeButton = (
            <button
              type="button"
              onClick={() => remove(line.variantId)}
              className="ml-auto grid size-7 shrink-0 place-items-center rounded-tag text-ink-soft hover:bg-sand hover:text-ink"
            >
              <Icon name="trash" className="size-4" />
              <span className="sr-only">Remove {line.productName}</span>
            </button>
          );
          return (
            <li
              key={line.variantId}
              className="flex gap-3 rounded-card bg-porcelain p-2.5 shadow-soft"
            >
              <Link
                href={line.href}
                onClick={onNavigate}
                className="well relative size-16 shrink-0 overflow-hidden rounded-xl"
                tabIndex={-1}
                aria-hidden="true"
              >
                {line.image && (
                  <Image
                    src={line.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain mix-blend-multiply"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={line.href}
                      onClick={onNavigate}
                      title={line.productName}
                      className="block truncate text-[0.8125rem] leading-snug font-medium hover:underline"
                    >
                      {line.productName}
                    </Link>
                    {!hasSaving && (
                      <p className="truncate text-[0.72rem] text-ink-soft">
                        {line.variantLabel}
                      </p>
                    )}
                  </div>
                  <p className="flex shrink-0 flex-col items-end font-numeral tabular-nums">
                    <span className="text-[0.8125rem] font-medium">
                      {money(line.lineTotal)}
                    </span>
                    {!hasSaving && line.compareAtTotal > line.lineTotal && (
                      <span className="text-[0.7rem] text-ink-faint line-through">
                        {money(line.compareAtTotal)}
                      </span>
                    )}
                  </p>
                </div>
                {hasSaving && (
                  /* Line 2: variant + saving badge, with the struck-through price. */
                  <div className="flex items-center justify-between gap-2 text-[0.72rem]">
                    <p className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium text-ink">
                        {line.variantLabel}
                      </span>
                      <span className="shrink-0 rounded-tag bg-clay-100 px-1.5 py-0.5 font-numeral text-[0.7rem] leading-none font-medium text-clay-600 tabular-nums">
                        Saved {money(line.savedAmount ?? 0)}
                      </span>
                    </p>
                    {line.compareAtTotal > line.lineTotal && (
                      <span className="shrink-0 font-numeral text-[0.7rem] text-ink-faint tabular-nums line-through">
                        {money(line.compareAtTotal)}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "mt-auto flex items-center justify-between pt-1.5",
                    fixedPack && hasSaving && "hidden",
                  )}
                >
                  {fixedPack ? null : (
                    <div
                      className="flex items-center rounded-tag bg-cream"
                      role="group"
                      aria-label={`Quantity for ${line.productName}`}
                    >
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-tag hover:bg-sand"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(line.variantId, line.qty - 1)}
                      >
                        <Icon name="minus" className="size-3.5" />
                      </button>
                      <span
                        className="w-6 text-center text-[0.8125rem] tabular-nums"
                        aria-live="polite"
                      >
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-tag hover:bg-sand disabled:opacity-40"
                        aria-label="Increase quantity"
                        disabled={line.qty >= MAX_QTY}
                        onClick={() => setQty(line.variantId, line.qty + 1)}
                      >
                        <Icon name="plus" className="size-3.5" />
                      </button>
                    </div>
                  )}
                  {removeButton}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="m-3 mt-3 rounded-[20px] bg-porcelain px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-float">
        {detailsOpen ? (
          /* Full summary — the bag's complete breakdown: shipping promise,
             subtotal, discount, total. The arrow folds it back. */
          <div id="bag-summary-details">
            <div className="flex items-center justify-between gap-3 border-b border-sand pb-3">
              <p className="font-ui text-[0.72rem] font-semibold tracking-[0.1em] text-ink-soft uppercase">
                Order summary
              </p>
            <button
              type="button"
              onClick={() => setDetailsOpen((o) => !o)}
              aria-expanded={detailsOpen}
              aria-controls="bag-summary-details"
              aria-label={detailsOpen ? "Hide order details" : "Show order details"}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-sand/70 text-ink transition-colors hover:bg-sand"
            >
              <Icon
                name="chevron-down"
                className={cn(
                  "size-4 transition-transform duration-300",
                  
                )}
              />
            </button>
            </div>

            {/* Free shipping — the store's real promise, on every order. */}
            <div className="flex items-center gap-3 pt-3">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-600"
              >
                <Icon name="truck" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-semibold">Free shipping</p>
                <p className="text-[0.72rem] leading-snug text-ink-soft">
                  {site.promise.shipping}.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="flex items-baseline gap-1.5 font-numeral text-[0.8125rem] tabular-nums">
                  <span className="font-semibold text-sage-600">FREE</span>
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-600 py-0.5 pr-2 pl-1.5 text-[0.68rem] leading-none font-semibold text-white">
                  <Icon name="check" className="size-3" strokeWidth={3} />
                  Applied
                </span>
              </div>
            </div>

            <dl className="mt-3 space-y-1.5 border-t border-sand pt-3 text-[0.8125rem]">
              {!pricePending && discount > 0.009 && (
                <>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-soft">Subtotal</dt>
                    <dd className="font-numeral tabular-nums text-ink-soft">
                      {formatMoney(subtotal + discount, currency)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex flex-wrap items-center gap-1.5 text-ink-soft">
                      Discounts
                      <span className="font-numeral text-[0.7rem] font-semibold text-clay-600 tabular-nums">
                        {Math.round((discount / (subtotal + discount)) * 100)}% off
                      </span>
                    </dt>
                    <dd className="font-numeral tabular-nums text-clay-600">
                      −{formatMoney(discount, currency)}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between border-t border-dashed border-sand pt-2 text-[0.95rem]">
                <dt className="font-semibold">Total</dt>
                <dd className="font-numeral font-semibold tabular-nums">
                  {money(subtotal)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          /* Compact summary: total with the struck-through price on the left;
             shipping + saving pills and the expand arrow on the right. */
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-ui text-[0.68rem] font-semibold tracking-[0.1em] text-ink-soft uppercase">
                Total
              </p>
              <p className="flex flex-wrap items-baseline gap-x-2 font-numeral tabular-nums">
                <span className="text-[1.5rem] leading-tight font-semibold">
                  {money(subtotal)}
                </span>
                {!pricePending && discount > 0.009 && (
                  <span className="text-[0.8rem] text-ink-faint line-through">
                    {formatMoney(subtotal + discount, currency)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <div className="flex flex-col items-end gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-800 px-2.5 py-1 font-ui text-[0.72rem] leading-none font-semibold text-white">
                  <Icon name="truck" className="size-3.5" />
                  Free shipping
                </span>
                {!pricePending && discount > 0.009 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-50 px-2.5 py-1 font-numeral text-[0.72rem] leading-none font-semibold text-clay-600 tabular-nums">
                    Saved {formatMoney(discount, currency)}
                  </span>
                )}
              </div>
            <button
              type="button"
              onClick={() => setDetailsOpen((o) => !o)}
              aria-expanded={detailsOpen}
              aria-controls="bag-summary-details"
              aria-label={detailsOpen ? "Hide order details" : "Show order details"}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-sand/70 text-ink transition-colors hover:bg-sand"
            >
              <Icon
                name="chevron-down"
                className={cn(
                  "size-4 transition-transform duration-300",
                  "rotate-180",
                )}
              />
            </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-[0.8125rem] text-error">
            {error}
          </p>
        )}
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={onCheckout}
          disabled={pending || pricePending}
        >
          {pending ? (
            "Opening secure checkout…"
          ) : pricePending ? (
            "Checkout"
          ) : (
            `Checkout • ${formatMoney(subtotal, currency)}`
          )}
        </button>
        <PaymentIcons methods={payments} className="mt-3" />
      </div>
    </>
  );
}
