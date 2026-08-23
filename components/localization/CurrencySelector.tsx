"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useLocalization } from "@/components/providers/LocalizationProvider";
import { Icon } from "@/components/ui/Icons";
import {
  CANONICAL_COUNTRY_BY_CURRENCY,
  currencyDisplayName,
} from "@/lib/localization/format";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

type Option = {
  countryCode: string;
  currencyCode: string;
  name: string;
  symbol: string;
};

/**
 * Currency switcher. One row per currency Shopify Markets actually publishes
 * (deduped), with a type-to-search filter. Picking a currency re-fetches every
 * price from Shopify so amounts update instantly.
 *
 * `bar` is the desktop header pill (symbol + code) and opens as a popover
 * anchored under the trigger. `drawer` is the mobile menu's icon-only circle;
 * its list opens as a bottom sheet portalled to <body>, because a popover
 * anchored to a button sitting in a centred icon row inside a transformed
 * drawer had nowhere to go but off the side of the screen.
 */
export function CurrencySelector({
  variant = "bar",
  dark = false,
  overHero = false,
}: {
  variant?: "bar" | "drawer";
  dark?: boolean;
  /** Over the transparent hero header: light text + translucent hover. */
  overHero?: boolean;
}) {
  const { ready, countries, defaultCountry, country, setCountry } =
    useLocalization();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const isDrawer = variant === "drawer";

  useEffect(() => setMounted(true), []);

  // The sheet covers the page, so the page must stop moving underneath it.
  useScrollLock(isDrawer && open);

  const options = useMemo<Option[]>(() => {
    const seen = new Map<string, Option>();
    for (const entry of countries) {
      const currencyCode = entry.currency.isoCode;
      if (seen.has(currencyCode)) continue;
      const canonical = CANONICAL_COUNTRY_BY_CURRENCY[currencyCode];
      const countryCode =
        canonical && countries.some((c) => c.isoCode === canonical)
          ? canonical
          : entry.isoCode;
      seen.set(currencyCode, {
        countryCode,
        currencyCode,
        name: currencyDisplayName(currencyCode),
        symbol: entry.currency.symbol,
      });
    }
    return [...seen.values()];
  }, [countries]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (o) =>
        o.currencyCode.toLowerCase().includes(needle) ||
        o.name.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) setQuery("");
      return next;
    });
  };

  /* Focus the search box the moment the panel opens — except on the sheet,
     where it would summon the keyboard over the list the shopper came to
     read. There they tap the field themselves. */
  useEffect(() => {
    if (open && !isDrawer) searchRef.current?.focus();
  }, [open, isDrawer]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      // The sheet is portalled outside rootRef, so it needs its own check or
      // every tap inside it would read as "outside" and close it.
      if (rootRef.current?.contains(target)) return;
      if (sheetRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass = isDrawer
    ? cn(
        "grid size-11 place-items-center rounded-md transition-colors duration-300",
        dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5",
      )
    : cn(
        "flex h-11 items-center gap-1.5 rounded-md px-2.5 text-[0.82rem] font-medium tracking-[0.02em] transition-colors duration-300",
        overHero ? "text-white hover:bg-white/15" : "text-ink hover:bg-ink/5",
      );

  /* The country list is a round trip away. Hold the control's own footprint
     with a spinner rather than rendering nothing, so the header and the
     drawer's icon row do not reflow when it lands. */
  if (!ready) {
    return (
      <span
        role="status"
        aria-label="Loading currencies"
        className={cn(
          triggerClass,
          "pointer-events-none",
          !isDrawer && "min-w-20 justify-center",
        )}
      >
        <Icon
          name="spinner"
          strokeWidth={2}
          className={cn(
            "size-4 animate-spin",
            dark ? "text-white/70" : "text-ink-mute",
          )}
        />
      </span>
    );
  }

  if (options.length <= 1) return null;

  /* Match on currency, not country: the saved country may be any country in a
     currency's market (FR), while the row for it is keyed to the canonical one
     (DE for EUR) — comparing countries would show "Auto" for a real pick. */
  const activeCurrency =
    (country != null
      ? countries.find((c) => c.isoCode === country)?.currency.isoCode
      : defaultCountry?.currency.isoCode) ?? null;
  const current = options.find((o) => o.currencyCode === activeCurrency);

  const pick = (code: string) => {
    setCountry(code);
    setOpen(false);
  };

  const list = (
    <CurrencyList
      searchRef={searchRef}
      query={query}
      setQuery={setQuery}
      filtered={filtered}
      country={country}
      activeCurrency={activeCurrency}
      onPick={pick}
      size={isDrawer ? "sheet" : "popover"}
    />
  );

  return (
    <div ref={rootRef} className={isDrawer ? undefined : "relative"}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={
          current
            ? `Currency: ${current.currencyCode}. Change currency`
            : "Select currency"
        }
        className={triggerClass}
      >
        <span
          aria-hidden="true"
          className={cn(
            "leading-none",
            isDrawer ? "text-sm font-semibold" : "text-[0.9rem]",
          )}
        >
          {current?.symbol ?? "$"}
        </span>
        {!isDrawer && <span>{current?.currencyCode ?? "Auto"}</span>}
        {!isDrawer && (
          <Icon
            name="chevron-down"
            className={cn(
              "size-3.5 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {open && !isDrawer && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-(--radius-card) border border-line bg-ivory shadow-(--shadow-lift)">
          {list}
        </div>
      )}

      {/* Portalled to <body>: the mobile drawer animates on a transform, which
          would otherwise trap a `position: fixed` sheet inside its box. */}
      {open &&
        isDrawer &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-80" role="dialog" aria-modal="true">
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
            />

            <div
              ref={sheetRef}
              className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col overflow-hidden rounded-t-[1.75rem] bg-ivory pb-[env(safe-area-inset-bottom)] shadow-(--shadow-lift)"
            >
              {/* Grab handle — the affordance that says "this can be
                  dismissed" before anyone reads a word. */}
              <span
                aria-hidden="true"
                className="mx-auto mt-3 h-1 w-11 shrink-0 rounded-full bg-line"
              />

              <div className="flex shrink-0 items-center justify-between gap-4 px-5 pt-4 pb-1">
                <h2 className="font-display text-lg font-bold text-ink uppercase">
                  Currency
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close currency picker"
                  className="grid size-10 place-items-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-ink"
                >
                  <Icon name="close" className="size-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">{list}</div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function CurrencyList({
  searchRef,
  query,
  setQuery,
  filtered,
  country,
  activeCurrency,
  onPick,
  size,
}: {
  searchRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (q: string) => void;
  filtered: Option[];
  country: string | null;
  activeCurrency: string | null;
  onPick: (countryCode: string) => void;
  size: "popover" | "sheet";
}) {
  const isSheet = size === "sheet";
  const rowClass = isSheet
    ? "flex w-full items-center gap-3 px-5 py-4 text-left"
    : "flex w-full items-center gap-3 px-4 py-2.5 text-left";

  return (
    <div>
      <div className={cn("px-4", isSheet ? "pt-2 pb-1" : "pt-2 pb-1")}>
        <div className="relative">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search currencies"
            aria-label="Search currencies"
            className="w-full rounded-full border border-line bg-parchment px-4 py-2.5 pr-10 text-sm text-ink transition-colors duration-300 placeholder:text-ink-mute hover:border-ink/30 focus:border-ink focus:outline-none"
          />
          <Icon
            name="globe"
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-mute"
          />
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto py-1">
        <button
          type="button"
          onClick={() => onPick("AUTO")}
          className={cn(rowClass, "hover:bg-parchment")}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
            <Icon name="globe" className="size-4" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-ink">Auto</span>
            <span className="block text-xs text-ink-mute">
              Shop default market
            </span>
          </span>
          {country === null && <Check />}
        </button>

        {filtered.map((option) => {
          const selected = option.currencyCode === activeCurrency;
          return (
            <button
              key={option.currencyCode}
              type="button"
              onClick={() => onPick(option.countryCode)}
              className={cn(rowClass, "hover:bg-parchment")}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-parchment font-semibold text-ink">
                {option.symbol}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink">
                  {option.name}
                </span>
                <span className="block text-xs text-ink-mute">
                  {option.currencyCode}
                </span>
              </span>
              {selected && <Check />}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-5 py-4 text-sm text-ink-mute">
            No currencies match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

function Check() {
  return (
    <Icon name="check" className="size-4 shrink-0 text-ink" strokeWidth={2.4} />
  );
}
