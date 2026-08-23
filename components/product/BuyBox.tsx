"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  CheckIcon,
  GiftIcon,
  GlobeIcon,
  MinusIcon,
  PlusIcon,
  ReturnIcon,
} from "@/components/ui/Icons";
import { Magnetic, easeOut } from "@/components/ui/Motion";
import { DeliveryPincodeCheck } from "@/components/product/DeliveryPincodeCheck";
import { useCart } from "@/components/providers/CartProvider";
import {
  useLocalizedAmount,
  useLocalization,
} from "@/components/providers/LocalizationProvider";
import { formatMoney } from "@/lib/money";
import { shopifyCheckout } from "@/lib/shopify-checkout";
import { site } from "@/lib/site";
import { arrivesShort, regionForCountry } from "@/lib/shipping";
import type { Product, Variant } from "@/lib/product";

const MAX_QTY = 10;

const priceSkeleton = (h: string, w: string) => (
  <span
    aria-hidden="true"
    className={`inline-block animate-pulse rounded-full bg-line align-middle ${h} ${w}`}
  />
);

/**
 * The purchase surface — gallery lives beside this in the product page, this
 * is everything else: price, stock, the pack picker, quantity and the two
 * ways to check out. Each pack is a fixed SKU (1 / 2 / 4 bands) — the pack
 * picker below chooses which one — and the stepper here multiplies how many
 * of *that* pack you want, same as ordering several of the same size.
 */
export function BuyBox({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState(
    product.variants[1]?.id ?? product.variants[0].id,
  );
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const { add } = useCart();
  const { country, defaultCountry } = useLocalization();
  const shippingRegion = regionForCountry(country ?? defaultCountry?.isoCode);

  const selected =
    product.variants.find((v) => v.id === selectedId) ?? product.variants[0];

  const selectedPrice = useLocalizedAmount(
    selected.id,
    selected.price.amount,
    selected.price.currencyCode,
    selected.compareAtPrice?.amount ?? null,
  );

  const save =
    selectedPrice.compareAtAmount != null &&
    selectedPrice.amount < selectedPrice.compareAtAmount
      ? Math.round(
          (1 - selectedPrice.amount / selectedPrice.compareAtAmount) * 100,
        )
      : 0;

  return (
    <div>
      {/* --------------------------------- price -------------------------------- */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <motion.span
          key={selected.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="font-display text-[2.4rem] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums"
        >
          {selectedPrice.pending
            ? priceSkeleton("h-9", "w-28")
            : formatMoney(selectedPrice.amount, selectedPrice.currencyCode)}
        </motion.span>
        {selectedPrice.compareAtAmount != null && (
          <span className="text-[1.05rem] text-ink-mute line-through tabular-nums">
            {formatMoney(
              selectedPrice.compareAtAmount,
              selectedPrice.currencyCode,
            )}
          </span>
        )}
        {save > 0 && (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.7rem] font-semibold text-volt">
            Save {save}%
          </span>
        )}
      </div>

      {/* --------------------------------- chips --------------------------------- */}
      <ul className="mt-4 flex flex-wrap items-center gap-1.5">
        <li className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line px-2.5 text-[0.72rem] font-medium text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          In stock
        </li>
        <li className="inline-flex h-7 items-center rounded-full border border-line px-2.5 text-[0.72rem] font-medium text-ink-soft">
          {product.material}
        </li>
      </ul>

      {/* --------------------------- delivery estimate ---------------------------- */}
      <div className="mt-5">
        <DeliveryPincodeCheck />
      </div>

      {/* ------------------------------- pack size -------------------------------- */}
      <fieldset className="mt-8">
        <legend className="mb-2.5 text-[0.68rem] font-semibold tracking-[0.2em] text-ink-mute uppercase">
          Pack size
        </legend>
        <div className="flex flex-col gap-2.5">
          {product.variants.map((v) => (
            <PackOption
              key={v.id}
              variant={v}
              selected={v.id === selected.id}
              onSelect={() => setSelectedId(v.id)}
            />
          ))}
        </div>
      </fieldset>

      {/* -------------------------------- quantity --------------------------------- */}
      <div className="mt-7 flex items-center gap-3">
        <div className="inline-flex h-14 shrink-0 items-center rounded-full bg-parchment">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="grid h-full w-12 place-items-center rounded-l-full text-ink transition-colors hover:bg-line disabled:opacity-35"
          >
            <MinusIcon className="size-4" />
          </button>
          <span
            aria-live="polite"
            aria-label={`Quantity: ${quantity}`}
            className="w-8 text-center text-[0.95rem] font-medium text-ink tabular-nums"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
            disabled={quantity >= MAX_QTY}
            aria-label="Increase quantity"
            className="grid h-full w-12 place-items-center rounded-r-full text-ink transition-colors hover:bg-line disabled:opacity-35"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>

        <Magnetic strength={0.15} className="block flex-1">
          <button
            type="button"
            onClick={() => add(selected.id, quantity)}
            className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-b from-volt-hot to-volt font-display text-[0.88rem] font-semibold tracking-widest whitespace-nowrap text-on-accent uppercase transition-all duration-400 ease-(--ease-out-expo) hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,0.42)_50%,transparent_62%)] transition-transform duration-900 ease-(--ease-out-expo) group-hover:translate-x-full"
            />
            <span className="relative">
              Add to bag —{" "}
              {selectedPrice.pending
                ? "…"
                : formatMoney(
                    selectedPrice.amount * quantity,
                    selectedPrice.currencyCode,
                  )}
            </span>
          </button>
        </Magnetic>
      </div>

      <button
        type="button"
        disabled={buying}
        onClick={async () => {
          setBuying(true);
          setBuyError(null);
          const result = await shopifyCheckout([
            { variantId: selected.id, qty: quantity },
          ]);
          if (result.ok) {
            window.location.href = result.checkoutUrl;
            return;
          }
          setBuyError(result.error);
          setBuying(false);
        }}
        className="mt-2.5 flex h-13 w-full items-center justify-center rounded-full border border-ink/20 font-display text-[0.85rem] font-semibold tracking-widest text-ink uppercase transition-colors duration-300 hover:border-ink/40 hover:bg-ink/3 disabled:opacity-50"
      >
        {buying ? "Taking you to checkout…" : "Buy it now"}
      </button>
      {buyError && (
        <p className="mt-2 text-center text-[0.78rem] text-red-700">
          {buyError}
        </p>
      )}

      <p className="mt-3 text-center text-[0.74rem] text-ink-mute">
        {formatMoney(
          selectedPrice.amount / selected.quantity,
          selectedPrice.currencyCode,
        )}{" "}
        per band · ships free · {arrivesShort(shippingRegion)}
      </p>

      {/* ------------------------------- guarantees ------------------------------- */}
      <ul className="mt-7 flex flex-col gap-2.5 border-t border-line pt-6 text-[0.8rem] text-ink-soft">
        <Guarantee icon={<GlobeIcon />}>{site.promise.shipping}</Guarantee>
        <Guarantee icon={<ReturnIcon />}>{site.promise.returns}</Guarantee>
        <Guarantee icon={<CheckIcon />}>{site.promise.warranty}</Guarantee>
        <Guarantee icon={<CheckIcon />}>{site.promise.support}</Guarantee>
      </ul>
    </div>
  );
}

function Guarantee({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="h-4 w-4 shrink-0 text-volt/80">{icon}</span>
      {children}
    </li>
  );
}

function PackOption({
  variant,
  selected,
  onSelect,
}: {
  variant: Variant;
  selected: boolean;
  onSelect: () => void;
}) {
  const price = useLocalizedAmount(
    variant.id,
    variant.price.amount,
    variant.price.currencyCode,
    variant.compareAtPrice?.amount ?? null,
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`group relative flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors duration-300 ${
        selected
          ? "border-volt/60 bg-accent-soft"
          : "border-line bg-linen hover:border-ink/20"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
            selected ? "border-volt bg-volt" : "border-line-strong"
          }`}
        >
          {selected && <CheckIcon className="size-3 text-on-accent" />}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-display text-[0.95rem] font-semibold text-ink">
              {variant.title}
            </span>
            {variant.badge && (
              <span className="rounded-full bg-volt/12 px-2 py-0.5 text-[0.6rem] font-semibold tracking-widest text-volt uppercase">
                {variant.badge}
              </span>
            )}
          </span>
          <span className="block text-[0.76rem] text-ink-mute">
            Qty: {variant.quantity} · {variant.subtitle}
          </span>
          {variant.offer && (
            <span className="mt-1 inline-flex items-center gap-1 text-[0.72rem] font-medium text-ink-soft">
              <GiftIcon className="size-3 text-volt" />
              {variant.offer}
            </span>
          )}
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span className="font-display block text-[1.05rem] font-bold tracking-[-0.02em] text-ink tabular-nums">
          {price.pending
            ? priceSkeleton("h-5", "w-14")
            : formatMoney(price.amount, price.currencyCode)}
        </span>
        {price.compareAtAmount != null && (
          <span className="block text-[0.72rem] text-ink-mute line-through tabular-nums">
            {formatMoney(price.compareAtAmount, price.currencyCode)}
          </span>
        )}
      </span>
    </button>
  );
}
