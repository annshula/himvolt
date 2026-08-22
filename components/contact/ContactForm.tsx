"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";

const CATEGORIES = [
  "Order question",
  "Shipping & tracking",
  "Returns & refunds",
  "Product question",
  "Something else",
];

const labelClass =
  "text-[0.7rem] font-semibold tracking-[0.14em] text-ink-soft uppercase";
const fieldClass =
  "w-full rounded-(--radius-card) border border-line bg-parchment px-4 py-3 text-sm text-ink transition-colors duration-300 placeholder:text-ink-mute hover:border-ink/30 focus:border-ink focus:outline-none";

/**
 * Demo form — no email provider is wired up behind this yet, so a submit
 * just validates and shows the same confirmation a real send would give.
 * Swap the fake delay in `onSubmit` for a real POST once one exists; the
 * fields and validation are already what that endpoint would need.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Fill in your name and a message — we need both to reply.");
      return;
    }
    setError(null);
    setSending(true);
    // No backend behind this yet — see the file doc comment.
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  };

  if (sent) {
    return (
      <div className="rounded-(--radius-card) border border-line bg-linen p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent text-on-accent">
          <Icon name="check" className="size-5" />
        </span>
        <p className="font-display mt-5 text-lg font-bold text-ink">
          Message sent
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          We reply within 12 hours, usually faster. Thanks for reaching out.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Category</span>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${fieldClass} cursor-pointer appearance-none pr-11`}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-mute"
          />
        </div>
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What can we help with?"
          rows={5}
          className={`${fieldClass} resize-none rounded-(--radius-card)`}
        />
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={sending} className="mt-1 w-full justify-center">
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
