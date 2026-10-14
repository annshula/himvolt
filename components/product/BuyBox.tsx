"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { PaymentIcons } from "@/components/ui/PaymentIcons";
import { SaleCountdown } from "@/components/product/SaleCountdown";
import { ShipsToSheet } from "@/components/product/ShipsToSheet";
import { useCart } from "@/components/providers/CartProvider";
import { useLocalization } from "@/components/providers/LocalizationProvider";
import Image from "@/components/ui/Image";
import { Icon } from "@/components/ui/Icons";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/product";
import type { PaymentMethod } from "@/lib/shopify/payments";
import { cn } from "@/lib/utils";

/**
 * The PDP's buying controls — laid out like the reference build's purchase
 * panel, top to bottom:
 *
 *   option cards (the upsell: each pack/colour carries its own price and
 *   saving on the card) → "Free delivery unlocked" strip + the offer timer →
 *   Add to bag → accepted payment logos → a sticky Add-to-bag bar on phones.
 *
 * There is deliberately no separate price block (the cards carry the price),
 * no quantity stepper and no "Buy it now": one primary action. Everything
 * that sits around this panel — chips, rating, title, perks, accordion,
 * delivery, reviews — is laid out by ProductPurchase.
 *
 * `selectedId`/`onSelectId` are controlled by the parent so that picking a
 * variant can also move the gallery's main image to match it.
 */

type Variant = Product["variants"][number];

type Priced = {
  v: Variant;
  /** The variant's display title, e.g. "2 bracelets", "Blue", "Gold-plated · 10mm". */
  label: string;
  axis1: string;
  axis2: string | null;
  /** How many items the variant bundles — drives "most popular" / "buy 1 get 1 free". */
  units: number;
  amount: number;
  /** Only ever a real markdown: above the price, never equal to it. */
  compareAt: number | null;
  currency: string;
};

/**
 * A variant title of "Gold-plated · 10mm" splits into two independently
 * pickable axes (finish, size); a title with no " · " — "1 bracelet", "Size
 * 6", "Blue" — is a single flat axis. Parsed from the title rather than
 * carried as separate fields because every product in lib/product.ts already
 * encodes it that way, and duplicating it as structured data would just be
 * two sources of truth to keep in sync.
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

/** Colour words a flat option axis can be made of: "Black", "Blue grips", "Red". */
const COLOUR_RE =
  /^(black|white|blue|red|green|grey|gray|silver|gold|rose|pink|orange|yellow|purple|brown|navy|teal)\b/i;

/** "2mm" < "3mm" < "10mm" < "12mm" — plain string sort would put "10mm" before "2mm". */
function bySizeAscending(a: string, b: string) {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b, undefined, { numeric: true });
}

/** What a flat (single-axis) option list is called: a pack count, a colour, or, failing both, a size. */
function flatLegend(values: string[]): string {
  if (values.length > 0 && values.every((v) => PACK_COUNT_RE.test(v)))
    return "Choose your pack";
  if (values.length > 0 && values.every((v) => COLOUR_RE.test(v)))
    return "Colour";
  return "Size";
}

/**
 * The reference's photo cards — one per variant, with the photo, name, price,
 * strike-through and saving on the card itself — for a short flat list: two to
 * four variants on a single axis, whether that's packs ("1 bracelet / 2
 * bracelets") or colours. The card carries the price, so there is no separate
 * price block above the button. A longer list (ring sizes) or a two-axis list
 * (finish × size) uses the reference's plain option cards instead, where a
 * photo per SKU would just be a wall — those keep a price line, since no card
 * shows one.
 */
function shouldUseCards(product: Product): boolean {
  const n = product.variants.length;
  if (n < 2 || n > 4) return false;
  return product.variants.every(
    (v) => splitVariantTitle(v.title).axis2 === null,
  );
}

const numericId = (gid: string) => gid.split("/").pop() ?? gid;

export function BuyBox({
  product,
  selectedId,
  onSelectId,
  payments,
}: {
  product: Product;
  selectedId: string;
  onSelectId: (id: string) => void;
  /** Methods checkout accepts, from Shopify — empty hides the logo row. */
  payments: PaymentMethod[];
}) {
  const { add, open } = useCart();
  const {
    ready,
    canLocalize,
    requestPrices,
    localizedPriceFor,
    isPriceSettled,
    detectedCountry,
  } = useLocalization();

  const [added, setAdded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  // Every variant's price is needed up front — the cards show all of them.
  // They are Shopify's own answer for the shopper's country (batched, one
  // request); the file's base price is only what shows while that is in
  // flight, behind a placeholder so a wrong currency never flashes.
  const variantIdKey = product.variants.map((v) => v.id).join(",");
  const variantIds = useMemo(() => variantIdKey.split(","), [variantIdKey]);
  useEffect(() => {
    requestPrices(variantIds);
  }, [variantIds, requestPrices]);

  const pending =
    !ready ||
    (canLocalize &&
      variantIds.some((id) => !localizedPriceFor(id) && !isPriceSettled(id)));

  const priced = useMemo<Priced[]>(
    () =>
      product.variants.map((v) => {
        const live = localizedPriceFor(v.id);
        const amount = live ? Number.parseFloat(live.amount) : v.price.amount;
        const compareRaw = live
          ? live.compareAtAmount != null
            ? Number.parseFloat(live.compareAtAmount)
            : null
          : (v.compareAtPrice?.amount ?? null);
        const { axis1, axis2 } = splitVariantTitle(v.title);
        return {
          v,
          label: v.title,
          axis1,
          axis2,
          units: Math.max(1, v.quantity || 1),
          amount,
          // Only ever a real markdown: above the price, never equal to it.
          compareAt:
            compareRaw != null && compareRaw > amount ? compareRaw : null,
          currency: live?.currencyCode ?? v.price.currencyCode,
        };
      }),
    [product.variants, localizedPriceFor],
  );

  const selected = priced.find((p) => p.v.id === selectedId) ?? priced[0];
  const canBuy = selected.v.availableForSale;
  const useCards = shouldUseCards(product);

  // The sticky bar appears once the main button has scrolled out above the fold.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setShowSticky(
        !entry!.isIntersecting && entry!.boundingClientRect.top < 0,
      ),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Restore a shared ?variant= link.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("variant");
    const fromUrl = param
      ? product.variants.find((v) => numericId(v.id) === param)
      : undefined;
    if (fromUrl) onSelectId(fromUrl.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (id: string) => {
    onSelectId(id);
    setAdded(false);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", numericId(id));
    window.history.replaceState(window.history.state, "", url);
  };

  const addToBag = () => {
    add(
      selected.v.id,
      1,
      Math.round(selected.amount * 100),
      selected.currency,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  // A product that ships to some countries only (custom.available_countries
  // in Shopify): a visitor whose detected country is outside the list is
  // asked to confirm first. Not blocked — they may have a delivery address
  // there — and an unknown location is never asked.
  const outside =
    product.availableCountries.length > 0 &&
    detectedCountry !== null &&
    !product.availableCountries.includes(detectedCountry);

  const onAdd = () => {
    if (!canBuy) return;
    if (outside) {
      setConfirmOpen(true);
      return;
    }
    addToBag();
  };

  // While Shopify's live price for the visitor's country is in flight an
  // amount is a shimmering placeholder of about the same size, not a base-
  // currency figure that would then change; the strike-through and saving
  // badges simply wait (`pending`) rather than showing placeholders too.
  const money = (amount: number, currency: string): ReactNode =>
    pending ? (
      <span
        aria-hidden="true"
        className="skeleton inline-block h-[0.95em] w-[4.4em] rounded-md align-[-0.12em]"
      />
    ) : (
      formatMoney(amount, currency)
    );

  return (
    <div>
      <div className="space-y-7">
        {product.variants.length > 1 &&
          (useCards ? (
            <PackCards
              items={priced}
              selectedId={selected.v.id}
              onChoose={choose}
              money={money}
              pending={pending}
            />
          ) : (
            <OptionFieldsets
              items={priced}
              selected={selected}
              onChoose={choose}
            />
          ))}

        {/* The pack cards carry their own price; every other layout shows
            it here, above the button (the reference's price line). */}
        {!useCards && (
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 sm:justify-start">
            {!pending && selected.compareAt != null && (
              <p className="font-numeral text-lg text-ink-soft tabular-nums line-through">
                {money(selected.compareAt, selected.currency)}
              </p>
            )}
            <p
              className="font-numeral text-heading font-semibold tabular-nums"
              aria-live="polite"
            >
              {money(selected.amount, selected.currency)}
            </p>
            {!pending && selected.compareAt != null && (
              <p className="inline-flex items-center rounded-tag bg-clay-600 px-2.5 py-1 font-numeral text-[0.8rem] leading-none font-bold tracking-wide text-white tabular-nums">
                −{Math.round((1 - selected.amount / selected.compareAt) * 100)}
                % OFF
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-9">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <FreeDeliveryUnlocked />
          {product.saleEndsAt && <SaleCountdown endsAt={product.saleEndsAt} />}
        </div>

        <button
          ref={buttonRef}
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={onAdd}
          disabled={!canBuy}
        >
          {!canBuy ? (
            "Sold out"
          ) : added ? (
            <>
              <Icon name="check" className="size-4" /> Added to bag
            </>
          ) : (
            "Add to bag"
          )}
        </button>

        <PaymentIcons methods={payments} className="mt-3" />
      </div>

      <ShipsToSheet
        open={confirmOpen}
        countries={product.availableCountries}
        visitorCountry={detectedCountry}
        onConfirm={() => {
          setConfirmOpen(false);
          addToBag();
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Sticky mobile bar */}
      <div
        className={cn(
          "glass fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-20 rounded-[20px] p-3 pl-5 transition-transform duration-500 ease-out-soft lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-[calc(100%+1.5rem)]",
        )}
        aria-hidden={!showSticky}
        inert={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[1.25rem] leading-tight">
              {selected.label}
            </p>
            <p className="font-numeral text-body-sm font-medium text-ink-soft tabular-nums">
              {money(selected.amount, selected.currency)}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={added ? open : onAdd}
            disabled={!canBuy}
          >
            {added ? "View bag" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Option cards ───────────────────────────────────────────────────────── */

/**
 * The photo tile for a pack card. When every pack shares one photo, a bigger
 * pack shows that shot once per set, fanned out — so the card still says "2
 * sets" at a glance without inventing imagery.
 */
function PackPhoto({
  src,
  units,
  fan,
  sizes,
  padded,
  reserve,
}: {
  src: string;
  units: number;
  fan: boolean;
  sizes: string;
  padded?: boolean;
  /** Keep the right edge clear, for a badge that sits on that corner. */
  reserve?: boolean;
}) {
  const count = fan ? Math.min(Math.max(units, 1), 3) : 1;
  if (count === 1) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={cn("object-contain mix-blend-multiply", padded && "p-1")}
      />
    );
  }
  const step = count === 2 ? 26 : 16;
  const width = 100 - (count - 1) * step;
  return (
    <span
      className="absolute inset-y-0 left-0"
      style={{ right: reserve ? "20%" : 0 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute inset-y-0"
          style={{ left: `${i * step}%`, width: `${width}%` }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes}
            className="object-contain mix-blend-multiply"
          />
        </span>
      ))}
    </span>
  );
}

/**
 * "Cards" option picker: one card per variant — a thumb-first stacked list on
 * phones, a row of photo cards from sm up. Price, compare-at and saving sit
 * on the card. A bigger pack priced the same as a smaller one is a real "get
 * N free" deal, derived from the two prices, never typed by hand.
 */
function PackCards({
  items,
  selectedId,
  onChoose,
  money,
  pending,
}: {
  items: Priced[];
  selectedId: string;
  onChoose: (id: string) => void;
  money: (amount: number, currency: string) => ReactNode;
  /** The live price hasn't landed: hold back strike-throughs and savings. */
  pending: boolean;
}) {
  const legend = flatLegend(items.map((i) => i.label));
  const rows = [...items].sort((a, b) => a.units - b.units);
  const sharedPhoto = rows.every((r) => r.v.image === rows[0]?.v.image);

  const freeFor = (c: Priced) => {
    const same = rows.find(
      (r) => r.units < c.units && Math.abs(r.amount - c.amount) < 0.005,
    );
    return same ? { free: c.units - same.units, of: same.units } : null;
  };

  const cards = rows.map((c) => {
    const deal = freeFor(c);
    const saved =
      c.compareAt != null
        ? Math.round((c.compareAt - c.amount) * 100) / 100
        : null;
    return {
      c,
      deal,
      offer: deal !== null,
      saved,
      checked: c.v.id === selectedId,
      available: c.v.availableForSale,
      tag: c.units === 2 ? "Most popular" : null,
      offerLine: deal ? `Buy ${deal.of}, get ${deal.free} free` : null,
    };
  });

  /* "Save N" badge: one colour on every card. */
  const SAVE_BADGE = "bg-sage-800 text-white";

  /* Flat cards — no drop shadows; selection is a 2px edge. It is drawn as an
     inset ring (box-shadow), not a border colour: this app's unlayered
     `* { border-color }` reset in globals.css beats any `border-*` colour
     utility regardless of specificity, so a border-based selection would
     never show. The 2px border underneath stays the quiet resting edge. */
  const surface = (c: (typeof cards)[number]) =>
    c.offer
      ? cn(
          "bg-white ring-inset",
          c.checked
            ? "ring-2 ring-clay-600"
            : "ring-1 ring-clay-600/50 hover:ring-clay-600",
        )
      : cn(
          "bg-transparent ring-inset",
          c.checked ? "ring-2 ring-sage-800" : "hover:ring-1 hover:ring-sage-300",
        );

  const cols =
    cards.length === 2
      ? "sm:grid-cols-2"
      : cards.length === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-4";

  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-body font-semibold">{legend}</legend>

      {/* Two layouts, each with its own radios (distinct group names so the
          browser never treats them as one group): a stacked, thumb-first list
          on phones, and the photo cards from sm up. */}

      {/* ── Phones ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 pt-3 sm:hidden">
        {cards.map((k) => (
          <label
            key={k.c.v.id}
            data-checked={k.checked}
            className={cn(
              "group relative flex cursor-pointer flex-col rounded-2xl border-2 transition-[border-color,transform] duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sage-800 motion-safe:active:scale-[0.985]",
              surface(k),
              !k.available && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="radio"
              name="option-m"
              value={k.c.v.id}
              checked={k.checked}
              onChange={() => onChoose(k.c.v.id)}
              disabled={!k.available}
              className="sr-only"
            />

            {/* Floating tag on the card's top edge. */}
            {k.tag && (
              <span
                className={cn(
                  "absolute -top-2.5 right-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-ui text-[0.6rem] leading-none font-semibold tracking-[0.08em] text-white uppercase",
                  k.offer
                    ? "bg-linear-to-r from-clay-600 to-clay-300"
                    : "bg-sage-800",
                )}
              >
                <Icon name={k.offer ? "gift" : "star"} className="size-3" />
                {k.tag}
              </span>
            )}

            <span
              className={cn(
                "flex items-center gap-3 px-3 pb-2.5",
                k.tag ? "pt-4" : "pt-2.5",
              )}
            >
              {/* Photo tile with the selection marker on its corner. */}
              <span className="relative block size-12 shrink-0">
                <span className="relative block size-full overflow-hidden rounded-xl">
                  <PackPhoto
                    src={k.c.v.image}
                    units={k.c.units}
                    fan={sharedPhoto}
                    reserve={Boolean(k.deal)}
                    sizes="48px"
                    padded
                  />
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -top-1.5 -left-1.5 grid size-4.5 place-items-center rounded-full border-2 transition-colors duration-200",
                    // One background per state — `bg-white` alongside
                    // `bg-sage-800` would leave the winner to stylesheet order.
                    k.checked
                      ? k.offer
                        ? "border-clay-600 bg-clay-600"
                        : "border-sage-800 bg-sage-800"
                      : "border-sand bg-white",
                  )}
                >
                  {k.checked && (
                    <Icon name="check" className="size-2.5 text-white" />
                  )}
                </span>
                {k.deal && (
                  <span className="absolute -right-2 -bottom-2 grid size-9 place-items-center rounded-full border-2 border-white bg-gold-500 text-center font-numeral text-[0.52rem] leading-[1.05] font-extrabold text-ink motion-safe:animate-[free-pop_1.6s_ease-in-out_infinite]">
                    +{k.deal.free}
                    <br />
                    FREE
                  </span>
                )}
              </span>

              <span className="flex min-w-0 flex-1 flex-col items-start">
                <span className="font-ui text-[0.92rem] leading-tight font-semibold text-ink">
                  {k.c.label}
                </span>
                {k.offerLine && (
                  <span className="text-[0.74rem] font-medium text-clay-600">
                    {k.offerLine}
                  </span>
                )}
                {!pending && k.saved != null && (
                  <span
                    className={cn(
                      "mt-1 inline-flex h-[18px] items-center justify-center rounded-tag px-1.5 pt-px font-numeral text-[0.68rem] leading-none font-medium tabular-nums",
                      SAVE_BADGE,
                    )}
                  >
                    Save {money(k.saved, k.c.currency)}
                  </span>
                )}
                {!k.available && (
                  <span className="mt-1 text-[0.7rem] text-ink-soft">
                    Sold out
                  </span>
                )}
              </span>

              <span className="flex shrink-0 flex-col items-end">
                {!pending && k.c.compareAt != null && (
                  <span className="font-numeral text-[0.7rem] text-ink-faint tabular-nums line-through decoration-1">
                    {money(k.c.compareAt, k.c.currency)}
                  </span>
                )}
                <span className="font-numeral text-[1.15rem] leading-none font-semibold tracking-tight text-ink tabular-nums">
                  {money(k.c.amount, k.c.currency)}
                </span>
              </span>
            </span>
          </label>
        ))}
      </div>

      {/* ── Tablet and desktop: photo cards ────────────────────────────── */}
      <div className={cn("hidden gap-3 sm:grid", cols)}>
        {cards.map((k) => (
          <label
            key={k.c.v.id}
            data-checked={k.checked}
            className={cn(
              "relative flex cursor-pointer flex-col items-center rounded-2xl border-2 px-3 pb-3 text-center transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sage-800",
              k.tag ? "pt-8" : "pt-6",
              surface(k),
              !k.available && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="radio"
              name="option-d"
              value={k.c.v.id}
              checked={k.checked}
              onChange={() => onChoose(k.c.v.id)}
              disabled={!k.available}
              className="sr-only"
            />
            {k.tag && (
              <span
                className={cn(
                  "absolute -top-px -left-px rounded-tl-2xl rounded-br-tag px-2.5 py-1.5 font-ui text-[0.68rem] leading-none font-semibold tracking-wide text-white uppercase",
                  k.offer ? "bg-clay-600" : "bg-sage-800",
                )}
              >
                {k.tag}
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full border-2 transition-colors duration-200",
                k.checked
                  ? k.offer
                    ? "border-clay-600 bg-clay-600"
                    : "border-sage-800 bg-sage-800"
                  : "border-sand bg-white",
              )}
            >
              {k.checked && <Icon name="check" className="size-3 text-white" />}
            </span>

            <span className="relative block aspect-square w-full max-w-24">
              <span className="relative block size-full overflow-hidden rounded-tag">
                <PackPhoto
                  src={k.c.v.image}
                  units={k.c.units}
                  fan={sharedPhoto}
                  reserve={Boolean(k.deal)}
                  sizes="96px"
                />
              </span>
              {k.deal && (
                <span className="absolute -right-2 -bottom-2 grid size-12 place-items-center rounded-full border-2 border-white bg-gold-500 text-center font-numeral text-[0.7rem] leading-[1.05] font-extrabold text-ink motion-safe:animate-[free-pop_1.6s_ease-in-out_infinite]">
                  +{k.deal.free}
                  <br />
                  FREE
                </span>
              )}
            </span>

            <span className="mt-2 text-body-sm font-medium">{k.c.label}</span>
            {k.offerLine && (
              <span className="text-[0.78rem] font-semibold text-clay-600">
                {k.offerLine}
              </span>
            )}
            <span className="mt-1 flex flex-col items-center">
              {!pending && k.c.compareAt != null && (
                <span className="font-numeral text-[0.72rem] text-ink-soft tabular-nums line-through">
                  {money(k.c.compareAt, k.c.currency)}
                </span>
              )}
              <span className="font-numeral text-lg font-semibold tabular-nums">
                {money(k.c.amount, k.c.currency)}
              </span>
            </span>
            {!pending && k.saved != null && (
              <span
                className={cn(
                  "mt-1.5 inline-flex h-5 items-center justify-center rounded-tag px-2 pt-px font-numeral text-[0.7rem] leading-none font-medium tabular-nums",
                  SAVE_BADGE,
                )}
              >
                Save {money(k.saved, k.c.currency)}
              </span>
            )}
            {!k.available && (
              <span className="mt-1 text-[0.72rem] text-ink-soft">
                Sold out
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Plain option cards for a long flat list (ring sizes) or two axes (finish ×
 * size) — the reference's text option cards in a grid, each axis its own
 * fieldset with the current value named beside the legend. Choosing a value
 * on the first axis keeps the second where it can (same size, in stock).
 */
function OptionFieldsets({
  items,
  selected,
  onChoose,
}: {
  items: Priced[];
  selected: Priced;
  onChoose: (id: string) => void;
}) {
  const twoAxis = items.some((i) => i.axis2 !== null);

  if (!twoAxis) {
    const sorted = [...items].sort((a, b) =>
      bySizeAscending(a.axis1, b.axis1),
    );
    return (
      <OptionGroup
        legend={flatLegend(items.map((i) => i.axis1))}
        current={selected.axis1}
        options={sorted.map((i) => ({
          key: i.v.id,
          label: i.axis1,
          checked: i.v.id === selected.v.id,
          available: i.v.availableForSale,
          onSelect: () => onChoose(i.v.id),
        }))}
      />
    );
  }

  const axis1Order: string[] = [];
  const groups = new Map<string, Priced[]>();
  for (const p of items) {
    if (!groups.has(p.axis1)) {
      groups.set(p.axis1, []);
      axis1Order.push(p.axis1);
    }
    groups.get(p.axis1)!.push(p);
  }
  const axis2Options = [...(groups.get(selected.axis1) ?? [])].sort((a, b) =>
    bySizeAscending(a.axis2 ?? "", b.axis2 ?? ""),
  );

  const pickAxis1 = (axis1: string) => {
    const group = groups.get(axis1)!;
    const sameSize = group.find(
      (p) => p.axis2 === selected.axis2 && p.v.availableForSale,
    );
    const fallback = group.find((p) => p.v.availableForSale) ?? group[0];
    onChoose((sameSize ?? fallback).v.id);
  };

  return (
    <>
      <OptionGroup
        legend="Style"
        current={selected.axis1}
        options={axis1Order.map((axis1) => {
          const group = groups.get(axis1)!;
          return {
            key: axis1,
            label: axis1,
            image: group[0].v.image,
            checked: axis1 === selected.axis1,
            available: group.some((p) => p.v.availableForSale),
            onSelect: () => pickAxis1(axis1),
          };
        })}
      />
      <OptionGroup
        legend={
          axis2Options.every(
            ({ axis2 }) => axis2 != null && PACK_COUNT_RE.test(axis2),
          )
            ? "Quantity"
            : "Size"
        }
        current={selected.axis2 ?? ""}
        options={axis2Options.map((p) => ({
          key: p.v.id,
          label: p.axis2 ?? "",
          checked: p.v.id === selected.v.id,
          available: p.v.availableForSale,
          onSelect: () => onChoose(p.v.id),
        }))}
      />
    </>
  );
}

function OptionGroup({
  legend,
  current,
  options,
}: {
  legend: string;
  current: string;
  options: {
    key: string;
    label: string;
    image?: string;
    checked: boolean;
    available: boolean;
    onSelect: () => void;
  }[];
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 flex w-full items-baseline justify-between text-body-sm font-semibold">
        {legend}
        <span className="font-normal text-ink-soft">{current}</span>
      </legend>
      <div
        className={cn(
          "grid gap-2.5 sm:grid-cols-3",
          // A few long labels (colours) stack on a phone, like the
          // reference; a run of short ones (ring sizes) stays three across.
          options.length > 3 ? "grid-cols-3" : "grid-cols-1",
        )}
      >
        {options.map((o) => (
          <label
            key={o.key}
            data-checked={o.checked}
            data-disabled={!o.available}
            className="option-card flex min-h-16 flex-col justify-center gap-0.5 px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sage-600"
          >
            <input
              type="radio"
              name={`opt-${legend}`}
              value={o.key}
              checked={o.checked}
              onChange={o.onSelect}
              disabled={!o.available}
              className="sr-only"
            />
            <span className="flex items-center gap-2.5">
              {o.image && (
                <span className="relative block size-9 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <Image
                    src={o.image}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-contain p-0.5"
                  />
                </span>
              )}
              <span className="text-body-sm font-medium">{o.label}</span>
            </span>
            {!o.available && (
              <span className="text-[0.75rem] text-ink-soft">Sold out</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ── Free delivery ──────────────────────────────────────────────────────── */

/** Confetti pieces: where each flies (px), its spin, and its colour. */
const CONFETTI = [
  { x: -46, y: -30, r: -200, c: "bg-gold-500" },
  { x: -30, y: 34, r: 160, c: "bg-sage-400" },
  { x: -64, y: 4, r: 240, c: "bg-clay-300" },
  { x: 8, y: -42, r: -120, c: "bg-sage-400" },
  { x: 44, y: -34, r: 220, c: "bg-gold-500" },
  { x: 60, y: 6, r: -180, c: "bg-clay-300" },
  { x: 34, y: 38, r: 140, c: "bg-sage-400" },
  { x: -8, y: 44, r: -240, c: "bg-gold-500" },
] as const;

/**
 * Celebratory "free delivery unlocked" strip, in the spirit of food-delivery
 * apps: a toned bar, a truck that drives in, a one-off confetti burst and a
 * soft light sweep. Decorative motion only; the text carries the message —
 * and the message is the store's real, store-wide shipping promise.
 */
function FreeDeliveryUnlocked() {
  return (
    <div className="relative min-w-0 flex-1 basis-56 overflow-hidden rounded-lg border border-dashed border-sage-300 bg-sage-50 py-1.5 pr-3 pl-2 text-sage-800">
      <span
        aria-hidden="true"
        className="unlock-anim pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-white/70 to-transparent motion-safe:animate-[unlock-sweep_3.6s_ease-in-out_infinite]"
      />
      <div className="relative flex items-center gap-3">
        <span className="relative grid size-9 shrink-0 place-items-center">
          <span
            aria-hidden="true"
            className="unlock-anim absolute inset-0 rounded-full border-2 border-sage-400/60 motion-safe:animate-[unlock-ring_1.8s_ease-out_0.5s_2]"
          />
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "unlock-anim absolute top-1/2 left-1/2 h-1.5 w-1 rounded-[1px] opacity-0",
                p.c,
                "motion-safe:animate-[unlock-burst_1.1s_ease-out_0.35s_1_both]",
              )}
              style={
                {
                  "--bx": `${p.x}px`,
                  "--by": `${p.y}px`,
                  "--br": `${p.r}deg`,
                } as React.CSSProperties
              }
            />
          ))}
          <span className="unlock-anim relative grid size-9 place-items-center text-sage-600 motion-safe:animate-[unlock-truck_0.7s_cubic-bezier(0.2,0.8,0.3,1)_both]">
            <Icon name="truck" className="size-6" strokeWidth={1.6} />
          </span>
          <span
            aria-hidden="true"
            className="unlock-anim absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full border-2 border-sage-50 bg-success text-white motion-safe:animate-[unlock-tick_0.4s_cubic-bezier(0.3,1.6,0.5,1)_0.6s_both]"
          >
            <Icon name="check" className="size-2.5" strokeWidth={3} />
          </span>
        </span>
        <p className="min-w-0 leading-tight">
          <span className="block font-ui text-[0.82rem] font-semibold tracking-tight">
            Yay! Free delivery unlocked
          </span>
          <span className="block text-[0.7rem] text-ink-soft">
            Applied to this order
          </span>
        </p>
      </div>
    </div>
  );
}
