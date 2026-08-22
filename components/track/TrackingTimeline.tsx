"use client";

import { motion } from "motion/react";
import { CheckIcon } from "@/components/ui/Icons";
import { easeOut } from "@/components/ui/Motion";
import type { TrackingStep } from "@/lib/cj";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/**
 * The same dot-and-spine journey OrderItemStatus.tsx draws for a signed-in
 * order, generalised for any carrier's checkpoints and driven by Framer
 * Motion instead of static CSS — each node scales in, each spine segment
 * draws downward into the next, and the current checkpoint carries a soft
 * pulse so the eye lands on "you are here" first.
 */
export function TrackingTimeline({ steps }: { steps: TrackingStep[] }) {
  return (
    <motion.ol
      variants={container}
      initial="hidden"
      animate="visible"
      className="mt-2"
    >
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <motion.li
            key={`${step.label}-${i}`}
            variants={{
              hidden: { opacity: 0, x: -16 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } },
            }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <span className="absolute top-6 bottom-0 left-[0.6875rem] w-0.5 overflow-hidden rounded-full bg-line">
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
                  style={{ transformOrigin: "0% 0%" }}
                  className={cn(
                    "block h-full w-full",
                    step.state === "pending" ? "bg-line" : "bg-volt",
                  )}
                />
              </span>
            )}

            <span className="relative z-10 mt-0.5 shrink-0">
              <TimelineDot state={step.state} />
            </span>

            <div className="min-w-0 flex-1 pb-1">
              <p
                className={cn(
                  "text-[0.92rem] font-semibold",
                  step.state === "pending" ? "text-ink-mute" : "text-ink",
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.78rem] text-ink-mute">
                {step.at && <span>{formatWhen(step.at)}</span>}
                {step.location && <span>· {step.location}</span>}
              </p>
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

function TimelineDot({ state }: { state: TrackingStep["state"] }) {
  if (state === "current") {
    return (
      <span className="relative grid size-6 place-items-center rounded-full bg-volt ring-4 ring-accent-soft">
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-volt"
        />
        <span className="relative size-2 rounded-full bg-on-accent" />
      </span>
    );
  }
  if (state === "done") {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-volt text-on-accent">
        <CheckIcon className="size-3" />
      </span>
    );
  }
  return <span className="grid size-6 place-items-center rounded-full border-2 border-dashed border-line-strong" />;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
