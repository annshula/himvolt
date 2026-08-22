"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

/** The sign-out label shared by every trigger (nav rail + header dropdown). */
export function SignOutLabel() {
  return (
    <>
      <Icon name="logout" className="size-4" />
      Sign out
    </>
  );
}

/**
 * Sign-out confirmation. Signing out is a one-way door — it revokes the tokens
 * at Shopify, so a mis-click costs a full round trip back through OAuth. The
 * dialog leads with "stay" so the destructive action is never the default.
 *
 * Controlled, and deliberately trigger-less: the header dropdown unmounts the
 * moment it closes, so the caller owns the open state at a level that outlives
 * its own menu and renders this alongside it.
 */
export function SignOutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useScrollLock(open);

  /* Wire Escape and move focus only while the dialog is up. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const confirm = () => {
    if (leaving) return;
    setLeaving(true);
    // Full navigation, not a router push: the route clears the cookie and then
    // hands off to Shopify's hosted logout on another origin.
    window.location.href = "/account/logout";
  };

  /*
    Portalled to <body>. Rendered in place the dialog could be trapped inside a
    transformed or clipped ancestor; z-[90] keeps it above the cart drawer and
    header.
  */
  const overlay = (
    <div
      className={cn("fixed inset-0 z-[90]", !open && "pointer-events-none")}
      /* `inert`, not `aria-hidden`: aria-hidden alone leaves the buttons in the
         tab order while the dialog is closed. inert removes them from focus,
         from the a11y tree and from hit-testing in one attribute. */
      inert={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/45 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="absolute inset-0 grid place-items-center p-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
          aria-describedby="signout-body"
          tabIndex={-1}
          className={cn(
            "relative w-full max-w-sm overflow-hidden rounded-(--radius-card) bg-ivory shadow-(--shadow-lift) transition-all duration-300 ease-(--ease-out-expo)",
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-4 scale-95 opacity-0",
          )}
        >
          {/* Black header band with the logout glyph on the seam. */}
          <div className="relative h-20 bg-ink">
            <span className="absolute bottom-0 left-1/2 z-10 grid size-16 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full border-4 border-ivory bg-ink text-white shadow-(--shadow-lift)">
              <Icon name="logout" className="size-6" strokeWidth={1.8} />
            </span>
          </div>

          <div className="px-6 pt-12 pb-7 text-center">
            <h2
              id="signout-title"
              className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink"
            >
              Leaving so soon?
            </h2>
            <p
              id="signout-body"
              className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft"
            >
              Your orders, saved addresses and profile stay exactly where they
              are. Signing back in only takes a tap.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3">
              <button
                type="button"
                onClick={confirm}
                disabled={leaving}
                className="text-[0.72rem] font-semibold tracking-[0.16em] text-ink-mute uppercase transition-colors duration-300 hover:text-red-700 disabled:opacity-50"
              >
                {leaving ? "Signing you out…" : "Yes, sign me out"}
              </button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full justify-center"
              >
                Stay signed in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
