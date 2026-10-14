"use client";

import { useEffect, useRef } from "react";

import { Icon } from "@/components/ui/Icons";
import { countryNames } from "@/lib/availability";

/**
 * "Ships to … only" confirmation, shown as a bottom sheet when a visitor
 * outside the countries a product ships to (custom.available_countries in
 * Shopify) taps Add to bag. It asks, it doesn't block: a visitor with a US
 * delivery address can carry on, and Shopify's shipping profile enforces the
 * destination at checkout.
 *
 * A native modal <dialog>, so focus is trapped, Esc cancels and the page
 * behind is inert; tapping the dimmed area also cancels.
 */
export function ShipsToSheet({
  open,
  countries,
  visitorCountry,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  /** ISO codes the product ships to. */
  countries: string[];
  /** The visitor's detected country, for the "you appear to be in …" line. */
  visitorCountry: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const shipsTo = countryNames(countries);
  const where = visitorCountry ? countryNames([visitorCountry]) : null;

  return (
    <dialog
      ref={ref}
      aria-labelledby="ships-to-title"
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto w-[calc(100%-1rem)] max-w-lg translate-y-0 rounded-3xl bg-porcelain p-5 text-ink shadow-drift backdrop:bg-ink/40 backdrop:backdrop-blur-[3px] open:motion-safe:animate-[sheet-up_380ms_var(--ease-out-soft)] mb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sage-100 text-sage-600"
        >
          <Icon name="truck" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="ships-to-title"
            className="font-ui text-[1.05rem] leading-snug font-semibold"
          >
            This item ships to {shipsTo} addresses only
          </h2>
          <p className="mt-1.5 text-body-sm text-ink-soft">
            {where ? `You appear to be in ${where}. ` : ""}
            You can still order it if you have a {shipsTo} delivery address.
            We&apos;ll check the address at checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-xl text-ink-soft hover:bg-sand"
        >
          <Icon name="close" className="size-4" />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className="btn-primary w-full"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-(--radius-control) bg-sand/70 px-5 py-3.5 font-ui text-[0.8125rem] font-semibold tracking-[0.08em] uppercase hover:bg-sand"
        >
          Cancel
        </button>
      </div>
    </dialog>
  );
}
