"use client";

import Image from "next/image";
import { useState } from "react";
import { SectionHeading, Section } from "@/components/ui/Section";
import {
  CheckIcon,
  ArrowIcon,
  GlobeIcon,
  ReturnIcon,
} from "@/components/ui/Icons";
import { useCart } from "@/components/providers/CartProvider";
import { useLocalizedAmount } from "@/components/providers/LocalizationProvider";
import { collection } from "@/content/copy";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";
import type { Product, Variant } from "@/lib/product";

const priceSkeleton = (h: string, w: string) => (
  <span
    aria-hidden="true"
    className={`inline-block animate-pulse rounded-full bg-line align-middle ${h} ${w}`}
  />
);

/**
 * Pricing + variant selection. This is the only stateful block on the page.
 *
 * "Add to bag" drops the chosen variant into the client-side cart and opens
 * the drawer; checkout then builds a Shopify Storefront cart server-side and
 * hands off to the hosted checkout URL.
 */
export default function Collection({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState(
    product.variants[1]?.id ?? product.variants[0].id,
  );
  const { add } = useCart();

  const selected =
    product.variants.find((v) => v.id === selectedId) ?? product.variants[0];

  const selectedPrice = useLocalizedAmount(
    selected.id,
    selected.price.amount,
    selected.price.currencyCode,
    selected.compareAtPrice?.amount ?? null,
  );

  return (
    <Section
      id="collection"
      className="grain overflow-hidden border-y border-line bg-parchment"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-[30vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/[0.09] blur-[120px]"
      />

      <SectionHeading
        align="center"
        eyebrow={collection.eyebrow}
        title={collection.headline}
        body={collection.sub}
      />

      <div className="mt-14 grid gap-4 lg:mt-16 lg:grid-cols-3">
        {product.variants.map((v, i) => (
          <VariantCard
            key={v.id}
            variant={v}
            index={i}
            selected={v.id === selected.id}
            onSelect={() => setSelectedId(v.id)}
          />
        ))}
      </div>

      {/* ------------------------------ buy bar ----------------------------- */}

      <div
        data-reveal
        className="mt-8 flex flex-col items-center gap-6 rounded-[var(--radius-card)] border border-line bg-linen/90 p-6 backdrop-blur-md sm:flex-row sm:justify-between sm:p-7"
      >
        <div className="text-center sm:text-left">
          <p className="text-[0.62rem] tracking-[0.26em] text-ink-mute uppercase">
            Your selection
          </p>
          <p className="font-display mt-2 text-[1.35rem] leading-none font-bold tracking-[-0.03em] text-ink">
            {selected.title}
            <span className="text-ink-mute"> · </span>
            {selectedPrice.pending
              ? priceSkeleton("h-5", "w-20")
              : formatMoney(selectedPrice.amount, selectedPrice.currencyCode)}
          </p>
          <p className="mt-2 text-[0.74rem] text-ink-mute">
            {selectedPrice.pending
              ? priceSkeleton("h-3", "w-28")
              : `${formatMoney(
                  selectedPrice.amount / selected.quantity,
                  selectedPrice.currencyCode,
                )} per band`}
            {" · ships free · arrives in 5–9 days"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => add(selected.id, 1)}
          className="group relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-volt-hot to-volt px-9 font-display text-[0.92rem] font-semibold tracking-[0.14em] whitespace-nowrap text-white uppercase shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] transition-all duration-400 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[0_18px_54px_-12px_rgba(0,0,0,0.7)] sm:w-auto"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,0.42)_50%,transparent_62%)] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:translate-x-full"
          />
          <span className="relative">Add to bag</span>
          <ArrowIcon className="relative h-4 w-4 transition-transform duration-400 group-hover:translate-x-1" />
        </button>
      </div>

      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.73rem] text-ink-mute">
        <Guarantee icon={<GlobeIcon />}>{site.promise.shipping}</Guarantee>
        <Guarantee icon={<ReturnIcon />}>{site.promise.returns}</Guarantee>
        <Guarantee icon={<CheckIcon />}>{site.promise.warranty}</Guarantee>
        <Guarantee icon={<CheckIcon />}>{site.promise.support}</Guarantee>
      </ul>
    </Section>
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
    <li className="flex items-center gap-2">
      <span className="h-3.5 w-3.5 text-volt/80">{icon}</span>
      {children}
    </li>
  );
}

function VariantCard({
  variant,
  index,
  selected,
  onSelect,
}: {
  variant: Variant;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const price = useLocalizedAmount(
    variant.id,
    variant.price.amount,
    variant.price.currencyCode,
    variant.compareAtPrice?.amount ?? null,
  );
  const save =
    price.compareAtAmount != null && price.amount < price.compareAtAmount
      ? Math.round((1 - price.amount / price.compareAtAmount) * 100)
      : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-reveal
      data-reveal-delay={String(index + 1)}
      className={`group relative overflow-hidden rounded-[var(--radius-card)] border p-6 text-left transition-all duration-500 ease-[var(--ease-out-expo)] lg:p-7 ${
        selected
          ? "border-volt/55 bg-linen shadow-[0_0_60px_-24px_rgba(0,0,0,0.4)]"
          : "border-line bg-linen/60 hover:border-ink/15 hover:bg-linen"
      }`}
    >
      {variant.badge && (
        <span
          className={`absolute top-5 right-5 rounded-full px-2.5 py-1 text-[0.56rem] font-semibold tracking-[0.18em] uppercase transition-colors duration-500 ${
            selected ? "bg-volt text-white" : "bg-line text-ink-mute"
          }`}
        >
          {variant.badge}
        </span>
      )}

      <div className="flex items-start gap-5">
        <span className="relative h-16 w-16 shrink-0">
          <Image
            src={variant.image}
            alt=""
            aria-hidden
            fill
            sizes="64px"
            className="object-contain"
          />
        </span>
        <div className="min-w-0 pt-1">
          <h3 className="font-display text-[1.05rem] leading-none font-semibold tracking-[-0.02em] text-ink">
            {variant.title}
          </h3>
          <p className="mt-2 text-[0.76rem] text-ink-mute">
            {variant.subtitle}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <span className="font-display text-[1.9rem] leading-none font-bold tracking-[-0.04em] text-ink tabular-nums">
          {price.pending
            ? priceSkeleton("h-7", "w-24")
            : formatMoney(price.amount, price.currencyCode)}
        </span>
        {price.compareAtAmount != null && (
          <span className="pb-1 text-[0.85rem] text-ink-mute line-through tabular-nums">
            {formatMoney(price.compareAtAmount, price.currencyCode)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[0.72rem]">
        <span className="text-ink-mute">
          {price.pending
            ? priceSkeleton("h-3", "w-24")
            : `${formatMoney(price.amount / variant.quantity, price.currencyCode)} per band`}
        </span>
        {save > 0 && (
          <span className="font-medium text-volt">Save {save}%</span>
        )}
      </div>

      <span
        aria-hidden
        className={`mt-6 flex h-9 items-center justify-center rounded-full border text-[0.66rem] font-semibold tracking-[0.16em] uppercase transition-all duration-500 ${
          selected
            ? "border-volt/50 bg-volt/12 text-volt"
            : "border-line text-ink-mute group-hover:border-ink/25 group-hover:text-ink-soft"
        }`}
      >
        {selected ? "Selected" : "Select"}
      </span>
    </button>
  );
}
