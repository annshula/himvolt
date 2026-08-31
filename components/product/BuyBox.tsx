"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  GlobeIcon,
  MinusIcon,
  PlusIcon,
  ReturnIcon,
} from "@/components/ui/Icons";
import { Magnetic, easeOut } from "@/components/ui/Motion";
import { DeliveryPincodeCheck } from "@/components/product/DeliveryPincodeCheck";
import { useCart } from "@/components/providers/CartProvider";
import { useLocalizedAmount } from "@/components/providers/LocalizationProvider";
import { formatMoney } from "@/lib/money";
import { shopifyCheckout } from "@/lib/shopify-checkout";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/product";

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
 *
 * `selectedId`/`onSelectId` are controlled by the parent (ProductPurchase)
 * rather than owned here, so picking a variant can also move ProductGallery's
 * main image to match it — a plain internal useState couldn't reach outside
 * this component to do that.
 */
export function BuyBox({
  product,
  selectedId,
  onSelectId,
}: {
  product: Product;
  selectedId: string;
  onSelectId: (id: string) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const { add } = useCart();

  const selected =
    product.variants.find((v) => v.id === selectedId) ?? product.variants[0];

  const selectedPrice = useLocalizedAmount(
    selected.id,
    selected.price.amount,
    selected.price.currencyCode,
    selected.compareAtPrice?.amount ?? null,
  );

  // The real count never reaches this component at all — lib/product.ts
  // derives this boolean server-side from Shopify's actual inventory, so
  // there's nothing confidential in the client bundle to accidentally render.
  const lowStock = selected.lowStock;

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
        {save >= 45 ? (
          <span className="rounded-full bg-volt px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-on-accent uppercase">
            Buy 1, get 1 free
          </span>
        ) : (
          save > 0 && (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.7rem] font-semibold text-volt">
              Save {save}%
            </span>
          )
        )}
      </div>

      {/* --------------------------------- chips --------------------------------- */}
      <ul className="mt-4 flex flex-wrap items-center gap-1.5">
        {lowStock ? (
          <li className="inline-flex h-7 items-center gap-1.5 rounded-full border border-amber-600/25 bg-amber-500/10 px-2.5 text-[0.72rem] font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Low stock — order soon
          </li>
        ) : (
          <li className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line px-2.5 text-[0.72rem] font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            In stock
          </li>
        )}
        <li className="inline-flex h-7 items-center rounded-full border border-line px-2.5 text-[0.72rem] font-medium text-ink-soft">
          {product.material}
        </li>
      </ul>

      {/* ------------------------------ variant picker ----------------------------- */}
      {product.variants.length > 1 && (
        <VariantPicker
          product={product}
          selectedId={selected.id}
          onSelect={onSelectId}
        />
      )}

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
            onClick={() => {
              add(selected.id, quantity);
              toast.success("Added to cart", {
                description: product.title,
                icon: (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                    <CheckIcon className="size-3" />
                  </span>
                ),
              });
            }}
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
        className="mt-2.5 flex h-13 w-full items-center justify-center rounded-full bg-ink font-display text-[0.85rem] font-semibold tracking-widest text-white uppercase transition-colors duration-300 hover:bg-ink/85 disabled:opacity-50"
      >
        {buying ? "Taking you to checkout…" : "Buy it now"}
      </button>
      {buyError && (
        <p className="mt-2 text-center text-[0.78rem] text-red-700">
          {buyError}
        </p>
      )}

      {selected.quantity > 1 && (
        <p className="mt-3 text-center text-[0.74rem] text-ink-mute">
          {formatMoney(
            selectedPrice.amount / selected.quantity,
            selectedPrice.currencyCode,
          )}{" "}
          each
        </p>
      )}

      {/* --------------------------- delivery estimate ---------------------------- */}
      <div className="mt-5">
        <DeliveryPincodeCheck />
      </div>

      {/* ------------------------------- guarantees ------------------------------- */}
      <ul className="mt-6 flex flex-col gap-2.5 text-[0.8rem] text-ink-soft">
        <Guarantee icon={<GlobeIcon />}>{site.promise.shipping}</Guarantee>
        <Guarantee icon={<ReturnIcon />}>{site.promise.returns}</Guarantee>
        <Guarantee icon={<CheckIcon />}>{site.promise.durability}</Guarantee>
        <Guarantee icon={<CheckIcon />}>{site.promise.support}</Guarantee>
      </ul>

      <p className="mt-5 text-[0.72rem] leading-relaxed text-ink-mute">
        We state what hematite is — composition, hardness, the streak test —
        not what it will do for you. No "boosts testosterone," no health
        claims. Just the mineral, honestly described.
      </p>
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

/**
 * A variant title of "Gold-plated · 10mm" splits into two independently
 * pickable axes (finish, size); a title with no " · " — "1 bracelet", "Size
 * 6" — is a single flat axis. Parsed from the title rather than carried as
 * separate fields because every product in lib/product.ts already encodes it
 * that way, and duplicating it as structured data would just be two sources
 * of truth to keep in sync.
 */
function splitVariantTitle(title: string): {
  axis1: string;
  axis2: string | null;
} {
  const [axis1, axis2] = title.split(" · ");
  return { axis1, axis2: axis2 ?? null };
}

/** A pack-count axis ("1 bracelet" / "2 bracelets") reads oddly under a "Size" legend — every value naming the product itself (not a measurement) means this is a quantity choice, not a fit choice. */
const PACK_COUNT_RE = /\b(bracelets?|rings?|bands?|pieces?)\b/i;

/** "2mm" < "3mm" < "10mm" < "12mm" — plain string sort would put "10mm" before "2mm". */
function bySizeAscending(a: string, b: string) {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b, undefined, { numeric: true });
}

const pillClass = (active: boolean) =>
  `rounded-full border px-4 py-2 text-[0.82rem] font-medium transition-colors duration-300 ${
    active
      ? "border-ink bg-ink text-white"
      : "border-line bg-linen text-ink-soft hover:border-ink/30"
  }`;

/**
 * Amazon-style picker: a product whose variants carry two axes (finish,
 * size) gets a row of image swatches for the first axis and a row of pills
 * for the second, with the current value of each named beside its label —
 * not the old single flat list of every SKU as its own full-width row.
 */
function VariantPicker({
  product,
  selectedId,
  onSelect,
}: {
  product: Product;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const parsed = product.variants.map((v) => ({
    v,
    ...splitVariantTitle(v.title),
  }));
  const selected = parsed.find((p) => p.v.id === selectedId) ?? parsed[0];
  const isTwoAxis = parsed.some((p) => p.axis2 !== null);

  if (!isTwoAxis) {
    const sortedFlat = [...parsed].sort((a, b) =>
      bySizeAscending(a.axis1, b.axis1),
    );
    const isPackCount = sortedFlat.every(({ axis1 }) => PACK_COUNT_RE.test(axis1));
    return (
      <fieldset className="mt-8">
        <legend className="mb-2.5 text-[0.68rem] font-semibold tracking-[0.2em] text-ink-mute uppercase">
          {isPackCount ? "Quantity" : "Size"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {sortedFlat.map(({ v, axis1 }) => {
            const dealPct =
              v.compareAtPrice && v.compareAtPrice.amount > v.price.amount
                ? Math.round((1 - v.price.amount / v.compareAtPrice.amount) * 100)
                : 0;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={v.id === selectedId}
                onClick={() => onSelect(v.id)}
                className={cn(pillClass(v.id === selectedId), "inline-flex items-center gap-1.5")}
              >
                {axis1}
                {isPackCount && dealPct >= 20 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.62rem] font-bold tracking-wide uppercase",
                      dealPct >= 45
                        ? "bg-volt text-on-accent"
                        : "bg-accent-soft text-volt",
                    )}
                  >
                    {dealPct >= 45 ? "1 free" : `−${dealPct}%`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  const axis1Order: string[] = [];
  const groups = new Map<string, typeof parsed>();
  for (const p of parsed) {
    if (!groups.has(p.axis1)) {
      groups.set(p.axis1, []);
      axis1Order.push(p.axis1);
    }
    groups.get(p.axis1)!.push(p);
  }
  const axis2Options = [...(groups.get(selected.axis1) ?? [])].sort((a, b) =>
    bySizeAscending(a.axis2 ?? "", b.axis2 ?? ""),
  );
  const axis2IsPackCount = axis2Options.every(
    ({ axis2 }) => axis2 != null && PACK_COUNT_RE.test(axis2),
  );

  const pickAxis1 = (axis1: string) => {
    const group = groups.get(axis1)!;
    const sameSize = group.find((p) => p.axis2 === selected.axis2);
    onSelect((sameSize ?? group[0]).v.id);
  };

  return (
    <>
      <fieldset className="mt-8">
        <div className="mb-2.5 flex items-baseline justify-between">
          <legend className="text-[0.68rem] font-semibold tracking-[0.2em] text-ink-mute uppercase">
            Style
          </legend>
          <span className="text-[0.8rem] font-medium text-ink">
            {selected.axis1}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {axis1Order.map((axis1) => {
            const rep = groups.get(axis1)![0].v;
            const isSelected = axis1 === selected.axis1;
            return (
              <button
                key={axis1}
                type="button"
                aria-label={axis1}
                aria-pressed={isSelected}
                onClick={() => pickAxis1(axis1)}
                // A plain `border-*` colour utility can't be trusted here — an
                // unlayered `* { border-color }` reset in globals.css always
                // beats it regardless of specificity (same cascade-layer issue
                // documented on the pincode input's focus ring). `ring-*` uses
                // box-shadow instead of border-color, so it isn't affected.
                className={`relative size-14 shrink-0 overflow-hidden rounded-lg border border-line transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-ink ring-offset-2"
                    : "hover:ring-1 hover:ring-ink/40 hover:ring-offset-1"
                }`}
              >
                <Image
                  src={rep.image}
                  alt={axis1}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
                {isSelected && (
                  <span className="absolute right-0.5 bottom-0.5 grid size-4 place-items-center rounded-full bg-ink text-white">
                    <CheckIcon className="size-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <div className="mb-2.5 flex items-baseline justify-between">
          <legend className="text-[0.68rem] font-semibold tracking-[0.2em] text-ink-mute uppercase">
            {axis2IsPackCount ? "Quantity" : "Size"}
          </legend>
          <span className="text-[0.8rem] font-medium text-ink">
            {selected.axis2}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {axis2Options.map(({ v, axis2 }) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={v.id === selectedId}
              onClick={() => onSelect(v.id)}
              className={pillClass(v.id === selectedId)}
            >
              {axis2}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
}
