"use client";

import Image from "next/image";
import { useState } from "react";

import { useCart } from "@/components/providers/CartProvider";
import {
  useLocalizedCart,
  useLocalization,
} from "@/components/providers/LocalizationProvider";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { formatMoney } from "@/lib/money";
import { shopifyCheckout } from "@/lib/shopify-checkout";
import { arrivesShort, regionForCountry } from "@/lib/shipping";
import { cn } from "@/lib/utils";

/**
 * The shopping bag. A right-hand drawer over a blurred scrim, animated with
 * CSS transitions (no animation library) and locked against the page scroll
 * while open. Checkout hands off to the same Shopify-hosted flow the
 * /checkout page uses.
 */
export function CartDrawer() {
  const { lines, count, subtotalCents, isOpen, close, setQty, remove } =
    useCart();
  const {
    currencyCode,
    lineTotalFor,
    subtotal,
    pending: pricePending,
  } = useLocalizedCart(lines);
  const { country, defaultCountry } = useLocalization();
  const shippingRegion = regionForCountry(country ?? defaultCountry?.isoCode);
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
      window.location.href = result.checkoutUrl;
      return;
    }
    setCheckoutError(result.error);
    setCheckingOut(false);
  };

  return (
    <div
      className={cn("fixed inset-0 z-70", !isOpen && "pointer-events-none")}
      inert={!isOpen}
    >
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-overlay backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-(--shadow-lift) transition-transform duration-500 ease-(--ease-out-expo)",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink uppercase">
            Your bag
            {count > 0 && <span className="ml-2 text-ink-mute">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close bag"
            className="grid size-10 place-items-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-ink hover:text-ink"
          >
            <Icon name="close" className="size-4" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-parchment text-ink-mute">
              <Icon name="bag" className="size-7" />
            </span>
            <p className="font-display text-lg font-bold text-ink">
              Your bag is empty
            </p>
            <p className="text-sm leading-relaxed text-ink-soft">
              One band, two ways to carry it — pick your set and it will show up
              here.
            </p>
            <Button href="/shop" onClick={close} arrow>
              Browse the sets
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-5">
              {lines.map((line) => (
                <li
                  key={line.variantId}
                  className="flex gap-4 border-b border-line py-5 first:pt-0 last:border-b-0"
                >
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-parchment">
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-[0.95rem] font-semibold text-ink">
                        {line.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(line.variantId)}
                        aria-label={`Remove ${line.name}`}
                        className="shrink-0 text-ink-mute transition-colors hover:text-ink"
                      >
                        <Icon name="trash" className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full border border-line">
                        <button
                          type="button"
                          onClick={() => setQty(line.variantId, line.qty - 1)}
                          aria-label={`Decrease quantity of ${line.name}`}
                          className="grid size-9 cursor-pointer place-items-center text-ink transition-colors hover:text-ink"
                        >
                          −
                        </button>
                        <span
                          aria-live="polite"
                          className="w-8 text-center text-[0.95rem] font-medium text-ink"
                        >
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.variantId, line.qty + 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                          className="grid size-9 cursor-pointer place-items-center text-ink transition-colors hover:text-ink"
                        >
                          +
                        </button>
                      </span>
                      <span className="text-[0.95rem] font-medium text-ink">
                        {pricePending ? (
                          <span
                            aria-hidden="true"
                            className="inline-block h-4 w-16 animate-pulse rounded-full bg-line align-middle"
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

            <footer className="border-t border-line px-6 py-5">
              {subtotalCents > 0 && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-500/10 px-3.5 py-2.5 text-[0.78rem] font-medium text-emerald-800">
                  <Icon name="check" className="size-4 shrink-0" />
                  Free tracked shipping — already included, no minimum.
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-[0.62rem] font-semibold tracking-[0.24em] text-ink-mute uppercase">
                  Subtotal
                </span>
                <span className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
                  {pricePending ? (
                    <span
                      aria-hidden="true"
                      className="inline-block h-7 w-28 animate-pulse rounded-full bg-line align-middle"
                    />
                  ) : (
                    formatMoney(subtotal, currencyCode)
                  )}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-mute">
                {subtotalCents > 0
                  ? `Order today, ${arrivesShort(shippingRegion)}.`
                  : `Shipping calculated at checkout · ${arrivesShort(shippingRegion)}.`}
              </p>
              {checkoutError && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkoutError}
                </p>
              )}
              <Button
                onClick={handleCheckout}
                disabled={checkingOut}
                arrow
                className="mt-5 w-full"
              >
                {checkingOut ? "Taking you to checkout…" : "Checkout"}
              </Button>
              <p className="mt-3 text-center text-xs text-ink-mute">
                Secure payment · 30-day returns
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
