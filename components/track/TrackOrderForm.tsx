"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TrackingTimeline } from "@/components/track/TrackingTimeline";
import { Icon } from "@/components/ui/Icons";
import { easeOut } from "@/components/ui/Motion";
import type { TrackingResult } from "@/lib/cj";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; result: TrackingResult };

export function TrackOrderForm() {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || state.kind === "loading") return;
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: value.trim() }),
      });
      const result = (await res.json()) as TrackingResult;
      setState({ kind: "result", result });
    } catch {
      setState({
        kind: "result",
        result: { ok: false, reason: "We couldn't reach tracking right now. Please try again." },
      });
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            name="package"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Order or tracking number"
            className="w-full rounded-full border border-line bg-parchment py-3.5 pr-4 pl-11 text-sm text-ink transition-colors duration-300 placeholder:text-ink-mute hover:border-ink/30 focus:border-ink focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={state.kind === "loading"}
          className="inline-flex h-[3.125rem] shrink-0 items-center justify-center rounded-full bg-linear-to-b from-volt-hot to-volt px-8 font-display text-[0.85rem] font-semibold tracking-[0.1em] whitespace-nowrap text-on-accent uppercase transition-all duration-300 ease-(--ease-out-expo) hover:-translate-y-0.5 disabled:opacity-60"
        >
          {state.kind === "loading" ? "Searching…" : "Track"}
        </button>
      </form>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {state.kind === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-(--radius-card) border border-line bg-linen py-16 text-center"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                className="grid size-11 place-items-center rounded-full border-2 border-line-strong border-t-volt"
              />
              <p className="text-sm text-ink-mute">Looking up your shipment…</p>
            </motion.div>
          )}

          {state.kind === "result" && state.result.ok && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="rounded-(--radius-card) border border-line bg-linen p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-5">
                <div>
                  <p className="text-[0.66rem] tracking-[0.2em] text-ink-mute uppercase">
                    Tracking number
                  </p>
                  <p className="font-display mt-1 text-lg font-bold tracking-[-0.02em] text-ink">
                    {state.result.trackingNumber}
                  </p>
                </div>
                {state.result.carrier && (
                  <span className="rounded-full border border-line px-3 py-1.5 text-[0.72rem] font-medium text-ink-soft">
                    {state.result.carrier}
                  </span>
                )}
              </div>
              <TrackingTimeline steps={state.result.steps} />
            </motion.div>
          )}

          {state.kind === "result" && !state.result.ok && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="flex flex-col items-center gap-4 rounded-(--radius-card) border border-line bg-linen px-6 py-16 text-center"
            >
              <span className="grid size-12 place-items-center rounded-full bg-parchment text-ink-mute">
                <Icon name="package" className="size-6" />
              </span>
              <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
                {state.result.reason}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
