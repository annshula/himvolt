"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { SectionHeading, Section } from "@/components/ui/Section";
import {
  CheckIcon,
  ArrowIcon,
  GlobeIcon,
  ReturnIcon,
} from "@/components/ui/Icons";
import { collection } from "@/content/copy";
import { site } from "@/lib/site";
import {
  formatMoney,
  savingsPercent,
  unitPrice,
  type Product,
  type Variant,
} from "@/lib/product";

/**
 * Pricing + variant selection. This is the only stateful block on the page.
 *
 * Checkout posts to /api/checkout, which asks Shopify for a cart and returns
 * its hosted checkout URL. Until the store credentials exist the route replies
 * with a "not connected" flag and we surface it honestly rather than pretending
 * to add something to a bag.
 */
export default function Collection({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState(
    product.variants[1]?.id ?? product.variants[0].id,
  );
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const selected =
    product.variants.find((v) => v.id === selectedId) ?? product.variants[0];

  const checkout = () => {
    setNotice(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: selected.id, quantity: 1 }),
        });
        const data = (await res.json()) as {
          checkoutUrl?: string;
          reason?: string;
        };
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setNotice(
          data.reason ??
            "Checkout is not connected yet. Leave your email below and we will tell you the moment it opens.",
        );
      } catch {
        setNotice(
          "Something went wrong reaching checkout. Try again in a moment.",
        );
      }
    });
  };

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
            {formatMoney(selected.price)}
          </p>
          <p className="mt-2 text-[0.74rem] text-ink-mute">
            {formatMoney(unitPrice(selected))} per band · ships free · arrives
            in 5–9 days
          </p>
        </div>

        <button
          type="button"
          onClick={checkout}
          disabled={pending}
          className="group relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-volt-hot to-volt px-9 font-display text-[0.92rem] font-semibold tracking-[0.14em] whitespace-nowrap text-white uppercase shadow-[0_10px_40px_-12px_rgba(255,91,56,0.75)] transition-all duration-400 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[0_18px_54px_-12px_rgba(255,91,56,0.95)] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,0.42)_50%,transparent_62%)] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:translate-x-full"
          />
          <span className="relative">
            {pending ? "One moment…" : "Add to bag"}
          </span>
          {!pending && (
            <ArrowIcon className="relative h-4 w-4 transition-transform duration-400 group-hover:translate-x-1" />
          )}
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-volt/25 bg-volt/[0.06] px-5 py-4 text-center text-[0.82rem] leading-relaxed text-ink-soft"
        >
          {notice}
        </p>
      )}

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
  const save = savingsPercent(variant);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-reveal
      data-reveal-delay={String(index + 1)}
      className={`group relative overflow-hidden rounded-[var(--radius-card)] border p-6 text-left transition-all duration-500 ease-[var(--ease-out-expo)] lg:p-7 ${
        selected
          ? "border-volt/55 bg-linen shadow-[0_0_60px_-24px_rgba(255,91,56,0.35)]"
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
          {formatMoney(variant.price)}
        </span>
        {variant.compareAtPrice && (
          <span className="pb-1 text-[0.85rem] text-ink-mute line-through tabular-nums">
            {formatMoney(variant.compareAtPrice)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[0.72rem]">
        <span className="text-ink-mute">
          {formatMoney(unitPrice(variant))} per band
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
