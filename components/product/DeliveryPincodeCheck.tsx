"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { CheckIcon, Icon } from "@/components/ui/Icons";
import { easeOut } from "@/components/ui/Motion";
import type { FreightResult } from "@/lib/cj";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; result: FreightResult; forPincode: string };

/**
 * A self-contained pincode check on the product page — separate from the
 * pack-size picker in BuyBox on purpose: transit time barely moves between
 * pack sizes (confirmed against CJDropshipping's own data when this site's
 * shipping estimates were built), so this always checks against the default
 * single-band variant rather than needing to track BuyBox's selection.
 *
 * Calls POST /api/shipping-estimate — a live CJDropshipping lookup for this
 * exact pincode, not the country-level range shown elsewhere on the page.
 */
export function DeliveryPincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pincode.trim();
    if (!trimmed || state.kind === "loading") return;
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/shipping-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: trimmed }),
      });
      const result = (await res.json()) as FreightResult;
      setState({ kind: "result", result, forPincode: trimmed });
    } catch {
      setState({
        kind: "result",
        result: { ok: false, reason: "We couldn't check delivery right now. Please try again." },
        forPincode: trimmed,
      });
    }
  };

  const trimmedPincode = pincode.trim();
  // Once a result is showing, re-checking the exact same pincode again is
  // pointless — disable until they actually change it, same as a form that
  // won't resubmit unless something about the input changed.
  const alreadyChecked =
    state.kind === "result" && state.forPincode === trimmedPincode;

  return (
    <div className="rounded-xl border border-line bg-linen px-4 py-3.5">
      <form onSubmit={onSubmit} className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-volt"
        >
          <Icon name="truck" className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <label
            htmlFor="delivery-pincode"
            className="block text-[0.66rem] font-semibold tracking-[0.14em] text-ink-mute uppercase"
          >
            Delivery estimate
          </label>
          <input
            id="delivery-pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter your pincode"
            inputMode="text"
            className="w-full border-b border-line bg-transparent pb-1 text-[0.88rem] text-ink placeholder:text-ink-mute focus:border-line focus:outline-none focus-visible:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!trimmedPincode || state.kind === "loading" || alreadyChecked}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-linear-to-b from-volt-hot to-volt px-3.5 font-display text-[0.68rem] font-semibold tracking-widest text-on-accent uppercase transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {state.kind === "loading" && (
            <Icon name="spinner" className="size-3.5 animate-spin" />
          )}
          {state.kind === "loading" ? "Checking" : "Check"}
        </button>
      </form>

      <AnimatePresence>
        {state.kind === "result" && (
          <motion.div
            key={state.forPincode}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden"
          >
            <p
              className={`flex items-start gap-2 pt-3 text-[0.8rem] ${
                state.result.ok ? "text-ink-soft" : "text-ink-mute"
              }`}
            >
              {state.result.ok ? (
                <>
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-volt text-on-accent">
                    <CheckIcon className="size-2.5" />
                  </span>
                  <span>
                    <span className="font-semibold text-ink">
                      Arrives in {state.result.estimate.minDays}–{state.result.estimate.maxDays} business days
                    </span>{" "}
                    to that pincode.
                  </span>
                </>
              ) : (
                state.result.reason
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
