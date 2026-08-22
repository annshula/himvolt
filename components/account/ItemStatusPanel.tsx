"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/Icons";
import { useScrollLock } from "@/lib/scroll-lock";

/**
 * Opens one item's full status on its own surface: a bottom sheet on a phone,
 * a centred dialog from md up.
 *
 * Everything visible is passed in already rendered on the server; this
 * component owns nothing but the open state and the portal.
 */
export function ItemStatusPanel({
  face,
  label,
  children,
}: {
  /** The card's own contents, rendered by the server component. */
  face: ReactNode;
  /** Accessible name for the trigger and the dialog. */
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label} — see full status`}
        className="group relative w-full cursor-pointer touch-manipulation overflow-hidden rounded-(--radius-card) border border-line bg-ivory text-left shadow-sm transition-[border-color,box-shadow,transform] duration-500 ease-(--ease-out-expo) hover:border-ink/40 hover:shadow-(--shadow-lift) focus-visible:border-ink focus-visible:outline-none active:scale-[0.995] active:bg-parchment active:duration-100"
      >
        {face}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[85] flex items-end justify-center md:items-center md:p-6">
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className="relative flex max-h-[88svh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-ivory pb-[env(safe-area-inset-bottom)] shadow-(--shadow-lift) md:max-h-[80vh] md:max-w-3xl md:rounded-(--radius-card) md:pb-0"
            >
              {/* The grab handle is the sheet's own dismiss control. */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="group/handle grid shrink-0 cursor-pointer touch-manipulation place-items-center py-3 md:hidden"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-11 rounded-full bg-line transition-colors duration-300 group-active/handle:bg-ink/40"
                />
              </button>

              {/* The dialog gets the corner X instead. */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 hidden size-11 place-items-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-parchment hover:text-ink md:grid"
              >
                <Icon name="close" className="size-4" strokeWidth={2.2} />
              </button>

              {children}
            </div>
          </div>,
          document.body,
        )}
    </li>
  );
}
