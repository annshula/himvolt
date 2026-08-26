"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done" | "error";

/**
 * A quiet email capture — one field, no popup, no gated quiz. Posts to
 * /api/newsletter, which creates a real Shopify customer with marketing
 * consent (visible in Shopify Admin > Customers) and hands back the one
 * shared welcome code. Lives in the footer rather than an exit-intent
 * overlay on purpose — this site's whole positioning is restraint over the
 * usual DTC funnel tricks, so the signup itself shouldn't feel like one.
 */
export function NewsletterForm({ light }: { light: boolean }) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Couldn't sign you up — try again.");
        return;
      }
      setStatus("done");
      setCode(data.code ?? null);
    } catch {
      setStatus("error");
      setMessage("Couldn't sign you up — try again.");
    }
  };

  if (status === "done") {
    return (
      <p
        className={cn(
          "mt-7 max-w-[38ch] text-[0.82rem] leading-relaxed",
          light ? "text-ink" : "text-chalk",
        )}
      >
        You&rsquo;re in.{" "}
        {code && (
          <>
            Use code{" "}
            <span className="font-display font-semibold tracking-wide">
              {code}
            </span>{" "}
            for 10% off your first order.
          </>
        )}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="newsletter-form mt-7 max-w-[34ch]">
      <label
        htmlFor={inputId}
        className={cn(
          "text-[0.62rem] tracking-[0.26em] uppercase",
          light ? "text-ink-mute" : "text-ash",
        )}
      >
        Stay in touch
      </label>
      <div
        className={cn(
          "mt-3 flex items-center gap-2 rounded-full border pl-4 pr-1.5 py-1.5 transition-colors",
          light
            ? "border-line bg-parchment focus-within:border-ink/40"
            : "border-white/15 bg-white/5 focus-within:border-white/40",
        )}
      >
        <input
          id={inputId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[0.82rem] outline-none",
            light
              ? "text-ink placeholder:text-ink-mute"
              : "text-chalk placeholder:text-steel",
          )}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-[0.72rem] font-semibold tracking-wide whitespace-nowrap uppercase transition-opacity disabled:opacity-50",
            light ? "bg-ink text-white" : "bg-white text-pitch",
          )}
        >
          {status === "loading" ? "…" : "Join"}
        </button>
      </div>
      <p
        className={cn(
          "mt-2.5 text-[0.68rem] leading-relaxed",
          status === "error"
            ? "text-red-500"
            : light
              ? "text-ink-mute/80"
              : "text-ash/70",
        )}
      >
        {message ?? "10% off your first order, then only what's worth sending."}
      </p>
    </form>
  );
}
