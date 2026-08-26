"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  requestReturnAction,
  type ReturnSelection,
} from "@/app/account/orders/[id]/actions";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import {
  reasonNeedsDetail,
  returnReasonLabel,
  SELECTABLE_RETURN_REASONS,
} from "@/lib/account/order-status";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";
import type {
  Order,
  OrderLineItem,
  ReturnReason,
} from "@/lib/shopify/types";

type Selection = { quantity: number; reason: string; note: string };
type EvidenceState = { uploading: boolean; count: number; error: string | null };

const labelClass =
  "text-[0.7rem] font-semibold tracking-[0.14em] text-ink-soft uppercase";

/**
 * Pick items, quantities and a reason, one row per product. Quantity drives
 * everything: an item at zero is simply not part of the request, so the reason
 * field only appears once the shopper has actually chosen to send something
 * back.
 */
export function ReturnRequestForm({
  order,
  items,
  redirectTo,
}: {
  order: Order;
  items: OrderLineItem[];
  redirectTo: string;
}) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [evidence, setEvidence] = useState<Record<string, EvidenceState>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (itemId: string, patch: Partial<Selection>) =>
    setSelections((current) => ({
      ...current,
      [itemId]: {
        quantity: current[itemId]?.quantity ?? 0,
        reason: current[itemId]?.reason ?? "",
        note: current[itemId]?.note ?? "",
        ...patch,
      },
    }));

  const uploadEvidence = async (itemId: string, fileList: FileList) => {
    if (fileList.length === 0) return;
    setEvidence((cur) => ({
      ...cur,
      [itemId]: { uploading: true, count: cur[itemId]?.count ?? 0, error: null },
    }));
    const body = new FormData();
    for (const file of Array.from(fileList)) body.append("files", file);
    try {
      const res = await fetch("/api/account/return-evidence", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setEvidence((cur) => ({
          ...cur,
          [itemId]: {
            uploading: false,
            count: cur[itemId]?.count ?? 0,
            error: data.error ?? "Upload failed.",
          },
        }));
        return;
      }
      setEvidence((cur) => ({
        ...cur,
        [itemId]: {
          uploading: false,
          count: (cur[itemId]?.count ?? 0) + data.count,
          error: null,
        },
      }));
    } catch {
      setEvidence((cur) => ({
        ...cur,
        [itemId]: {
          uploading: false,
          count: cur[itemId]?.count ?? 0,
          error: "Upload failed — try again.",
        },
      }));
    }
  };

  const selectedCount = Object.values(selections).reduce(
    (sum, s) => sum + Math.max(0, s.quantity),
    0,
  );

  const refund = items.reduce((sum, item) => {
    const selection = selections[item.id];
    if (!selection || selection.quantity <= 0 || !item.price) return sum;
    return sum + Number(item.price.amount) * selection.quantity;
  }, 0);

  /* The order's own currency, never the one picked in the header — a refund is
     paid back in whatever was charged. */
  const currency =
    order.totalPrice?.currencyCode ??
    items.find((item) => item.price)?.price?.currencyCode;

  const handleSubmit = () => {
    setError(null);

    const payload: ReturnSelection[] = [];
    for (const item of items) {
      const selection = selections[item.id];
      if (!selection || selection.quantity <= 0) continue;
      if (!selection.reason) {
        setError("Choose a reason for each item you want to return.");
        return;
      }
      if (
        reasonNeedsDetail(selection.reason as ReturnReason) &&
        !selection.note.trim()
      ) {
        setError(
          "Describe what's wrong for any item marked damaged, wrong, or not as described — we need this to file a claim on your behalf.",
        );
        return;
      }
      payload.push({
        lineItemId: item.id,
        quantity: selection.quantity,
        reason: selection.reason,
        note: selection.note.trim() || undefined,
      });
    }

    if (payload.length === 0) {
      setError("Select at least one item to return.");
      return;
    }

    startTransition(async () => {
      const result = await requestReturnAction(order.id, payload);
      if (!result.ok) {
        setError(result.message ?? "We could not submit that return.");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <ul className="flex flex-col gap-4">
        {items.map((item) => {
          const selection = selections[item.id];
          const quantity = selection?.quantity ?? 0;
          return (
            <li
              key={item.id}
              className="rounded-(--radius-card) border border-line bg-ivory p-5 shadow-sm sm:p-6"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image.url}
                    alt={item.image.altText ?? ""}
                    className="size-16 shrink-0 rounded-xl bg-parchment object-cover"
                  />
                ) : (
                  <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-parchment text-ink-mute">
                    <Icon name="bag" className="size-5" />
                  </span>
                )}

                <div className="min-w-0">
                  <p className="font-display font-semibold text-ink">
                    {item.title}
                  </p>
                  {item.variantTitle &&
                    item.variantTitle !== "Default Title" && (
                      <p className="text-xs text-ink-mute">
                        {item.variantTitle}
                      </p>
                    )}
                  {item.price && (
                    <p className="mt-1 text-sm text-ink-soft">
                      {formatMoney(item.price.amount, item.price.currencyCode)}{" "}
                      each · {item.quantity} ordered
                    </p>
                  )}
                </div>

                <div className="col-start-2 flex items-center justify-end gap-3 sm:col-start-3">
                  <span className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-soft uppercase sm:hidden">
                    Returning
                  </span>
                  <QuantityStepper
                    value={quantity}
                    max={item.quantity}
                    title={item.title}
                    onChange={(next) => update(item.id, { quantity: next })}
                  />
                </div>
              </div>

              {quantity > 0 && (
                <div className="mt-5 flex max-w-sm flex-col gap-4">
                  <label className="flex flex-col gap-2">
                    <span className={labelClass}>
                      Why are you sending it back?
                    </span>
                    <div className="relative">
                      <select
                        value={selection?.reason ?? ""}
                        onChange={(event) =>
                          update(item.id, { reason: event.target.value })
                        }
                        className="w-full cursor-pointer appearance-none rounded-full border border-line bg-parchment px-4 py-3 pr-11 text-sm text-ink transition-colors duration-300 hover:border-ink/30 focus:border-ink focus:outline-none"
                      >
                        <option value="">Select a reason</option>
                        {SELECTABLE_RETURN_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {returnReasonLabel(reason)}
                          </option>
                        ))}
                      </select>
                      <Icon
                        name="chevron-down"
                        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-mute"
                      />
                    </div>
                  </label>

                  {selection?.reason &&
                    reasonNeedsDetail(selection.reason as ReturnReason) && (
                    <>
                      <label className="flex flex-col gap-2">
                        <span className={labelClass}>
                          Describe what&rsquo;s wrong
                        </span>
                        <textarea
                          value={selection.note}
                          onChange={(event) =>
                            update(item.id, { note: event.target.value })
                          }
                          rows={3}
                          maxLength={500}
                          placeholder="What's damaged, wrong, or different from what you expected?"
                          className="w-full resize-none rounded-2xl border border-line bg-parchment px-4 py-3 text-sm text-ink transition-colors duration-300 hover:border-ink/30 focus:border-ink focus:outline-none"
                        />
                      </label>

                      <div className="flex flex-col gap-2">
                        <span className={labelClass}>
                          Attach photos or a video
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(event) => {
                            if (event.target.files) {
                              uploadEvidence(item.id, event.target.files);
                            }
                            event.target.value = "";
                          }}
                          className="cursor-pointer text-sm text-ink-soft file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:tracking-wide file:text-white file:uppercase"
                        />
                        {evidence[item.id]?.uploading && (
                          <p className="text-xs text-ink-mute">Uploading…</p>
                        )}
                        {!evidence[item.id]?.uploading &&
                          !!evidence[item.id]?.count && (
                            <p className="text-xs text-emerald-700">
                              {evidence[item.id].count} file
                              {evidence[item.id].count === 1 ? "" : "s"}{" "}
                              attached.
                            </p>
                          )}
                        {evidence[item.id]?.error && (
                          <p className="text-xs text-red-600">
                            {evidence[item.id].error}{" "}
                            <a
                              href={`mailto:${site.email}?subject=${encodeURIComponent(
                                `Return evidence — order ${order.name}`,
                              )}&body=${encodeURIComponent(
                                `Item: ${item.title}\nOrder: ${order.name}\n\nAttach your photos or a short video here and send — this helps us resolve it faster.`,
                              )}`}
                              className="underline decoration-red-600/40 underline-offset-2 hover:decoration-red-600"
                            >
                              Email us instead
                            </a>
                            .
                          </p>
                        )}
                      </div>
                    </>
                    )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <aside className="rounded-(--radius-card) border border-line bg-ivory p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-bold text-ink uppercase">
          Summary
        </h2>

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <span className="text-sm text-ink-soft">
            {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
          </span>
          <span className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            {formatMoney(refund, currency)}
          </span>
        </div>
        <p className="mt-2 text-xs text-ink-mute">
          Estimated refund{currency ? ` in ${currency}` : ""}, before we confirm
          your shipping instructions.
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={pending || selectedCount === 0}
          className="mt-6 w-full justify-center"
        >
          {pending ? "Sending your request…" : "Request return"}
        </Button>

        <p className="mt-4 text-xs text-ink-mute">
          We will email you shipping instructions within one business day.
        </p>
      </aside>
    </div>
  );
}

function QuantityStepper({
  value,
  max,
  title,
  onChange,
}: {
  value: number;
  max: number;
  title: string;
  onChange: (next: number) => void;
}) {
  const stepClass =
    "grid size-10 cursor-pointer place-items-center text-ink transition-colors duration-300 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35";

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center rounded-full border border-line bg-parchment">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          aria-label={`Return one fewer ${title}`}
          className={stepClass}
        >
          <Icon name="minus" className="size-4" strokeWidth={2} />
        </button>
        <span
          aria-live="polite"
          aria-label={`Returning ${value} of ${max} ${title}`}
          className="w-8 text-center font-medium text-ink"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Return one more ${title}`}
          className={stepClass}
        >
          <Icon name="plus" className="size-4" strokeWidth={2} />
        </button>
      </div>
      <span className="text-xs text-ink-mute">of {max}</span>
    </div>
  );
}
