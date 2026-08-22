"use client";

import Image from "next/image";
import { useState } from "react";

import { useCart } from "@/components/providers/CartProvider";
import { useLocalizedCart } from "@/components/providers/LocalizationProvider";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { formatMoney } from "@/lib/money";
import { shopifyCheckout } from "@/lib/shopify-checkout";

/**
 * Order review on /checkout. "Pay now" hands off to the same Shopify-hosted
 * checkout the cart drawer uses — one server-built Storefront cart, one
 * redirect — so the two entry points cannot drift apart.
 */
export function CheckoutSummary() {
  const { lines, setQty, remove, clear } = useCart();
  const {
    currencyCode,
    unitAmountFor,
    lineTotalFor,
    subtotal,
    pending: pricePending,
  } = useLocalizedCart(lines);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    setCheckoutError(null);
    const result = await shopifyCheckout(
      lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
    );
    if (result.ok) {
      // The bag is now committed to Shopify's checkout — empty the local cart.
      clear();
      window.location.href = result.checkoutUrl;
      return;
    }
    setCheckoutError(result.error);
    setCheckingOut(false);
  };

  if (lines.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-start gap-5">
        <p className="text-sm leading-relaxed text-ink-soft">
          Your bag is empty. Pick a set and it will show up here.
        </p>
        <Button href="#collection" arrow>
          Choose your set
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
      <ul className="min-w-0">
        {lines.map((line) => (
          <li
            key={line.variantId}
            className="flex gap-5 border-b border-line py-6 first:border-t first:pt-6"
          >
            <span className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-parchment">
              <Image
                src={line.image}
                alt={line.name}
                fill
                sizes="96px"
                className="object-contain"
              />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {line.name}
                  </p>
                  <p className="mt-1 text-sm text-ink-mute">
                    {pricePending ? (
                      <span
                        aria-hidden="true"
                        className="inline-block h-3 w-24 animate-pulse rounded-full bg-line align-middle"
                      />
                    ) : (
                      <>
                        {formatMoney(
                          unitAmountFor(line.variantId),
                          currencyCode,
                        )}{" "}
                        each
                      </>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.variantId)}
                  aria-label={`Remove ${line.name}`}
                  className="shrink-0 text-ink-mute transition-colors hover:text-ink"
                >
                  <Icon name="trash" className="size-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => setQty(line.variantId, line.qty - 1)}
                    aria-label={`Decrease quantity of ${line.name}`}
                    className="grid size-10 place-items-center text-ink hover:text-ink"
                  >
                    <Icon name="minus" className="size-4" strokeWidth={2} />
                  </button>
                  <span className="w-9 text-center text-base font-medium text-ink">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(line.variantId, line.qty + 1)}
                    aria-label={`Increase quantity of ${line.name}`}
                    className="grid size-10 place-items-center text-ink hover:text-ink"
                  >
                    <Icon name="plus" className="size-4" strokeWidth={2} />
                  </button>
                </span>
                <span className="text-lg font-medium text-ink">
                  {pricePending ? (
                    <span
                      aria-hidden="true"
                      className="inline-block h-5 w-20 animate-pulse rounded-full bg-line align-middle"
                    />
                  ) : (
                    formatMoney(
                      lineTotalFor(line.variantId, line.qty),
                      currencyCode,
                    )
                  )}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-(--radius-card) border border-line bg-ivory p-7 shadow-[var(--shadow-lift)] lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-bold text-ink uppercase">
          Order summary
        </h2>

        <dl className="mt-6 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Subtotal</dt>
            <dd className="text-ink">
              {pricePending ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-20 animate-pulse rounded-full bg-line align-middle"
                />
              ) : (
                formatMoney(subtotal, currencyCode)
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Shipping</dt>
            <dd className="text-ink">Free</dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-4">
            <dt className="text-[0.62rem] font-semibold tracking-[0.24em] text-ink-mute uppercase">
              Total
            </dt>
            <dd className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
              {pricePending ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-7 w-28 animate-pulse rounded-full bg-line align-middle"
                />
              ) : (
                formatMoney(subtotal, currencyCode)
              )}
            </dd>
          </div>
        </dl>

        {checkoutError && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {checkoutError}
          </p>
        )}

        <Button
          onClick={handleCheckout}
          disabled={checkingOut}
          arrow
          className="mt-7 w-full justify-center"
        >
          {checkingOut ? "Taking you to checkout…" : "Pay now"}
        </Button>

        <ul className="mt-6 flex flex-col gap-2.5 text-sm text-ink-soft">
          {["Free tracked shipping", "30-day returns", "Secure checkout"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Icon
                  name="check"
                  className="size-4 text-ink"
                  strokeWidth={2.2}
                />
                {item}
              </li>
            ),
          )}
        </ul>
      </aside>
    </div>
  );
}
