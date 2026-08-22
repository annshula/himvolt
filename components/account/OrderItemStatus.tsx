import Link from "next/link";

import { ItemStatusPanel } from "@/components/account/ItemStatusPanel";
import { Icon, type IconName } from "@/components/ui/Icons";
import {
  fulfillmentStatus,
  itemJourney,
  returnForLineItem,
  returnReasonLabel,
  returnStatus,
  type JourneyNode,
  type JourneyState,
  type ShipmentGroup,
  type StatusTone,
} from "@/lib/account/order-status";
import { formatMoney, shortDate } from "@/lib/money";
import type {
  Order,
  OrderLineItem,
  OrderReturnSummary,
} from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** Card accents, keyed to the same tones the status badges already use. */
const accents: Record<StatusTone, { edge: string; chip: string }> = {
  neutral: {
    edge: "from-ink/10 to-ink/10",
    chip: "bg-ink/5 text-ink-soft",
  },
  rose: {
    edge: "from-red-400 to-red-600",
    chip: "bg-red-50 text-red-700",
  },
  lilac: {
    edge: "from-slate-300 to-slate-500",
    chip: "bg-slate-100 text-slate-700",
  },
  mint: {
    edge: "from-emerald-400 to-emerald-500",
    chip: "bg-emerald-50 text-emerald-700",
  },
  butter: {
    edge: "from-amber-300 to-amber-500",
    chip: "bg-amber-50 text-amber-700",
  },
  ink: { edge: "from-ink to-ink", chip: "bg-ink text-white" },
};

function glyphFor(isReturning: boolean, status: string | null): IconName {
  if (isReturning) return "refresh";
  if (status === "SUCCESS") return "check";
  if (status === "CANCELLED" || status === "FAILURE" || status === "ERROR") {
    return "alert";
  }
  if (
    !status ||
    status === "UNFULFILLED" ||
    status === "OPEN" ||
    status === "PENDING_FULFILLMENT"
  ) {
    return "package";
  }
  return "truck";
}

/**
 * One item in an order: a compact row carrying where it has got to, opening
 * its full history on a surface of its own — a bottom sheet on a phone, a
 * two-column dialog from md up.
 */
export function OrderItemStatus({
  item,
  group,
  order,
  returns,
}: {
  item: OrderLineItem;
  group: ShipmentGroup;
  order: Order;
  returns: OrderReturnSummary | null;
}) {
  const detail = returnForLineItem(item.id, returns);
  const journey = itemJourney(group, order, detail);

  const tone: StatusTone = detail
    ? returnStatus(detail.status).tone
    : fulfillmentStatus(group.fulfillment?.status ?? null).tone;
  const accent = accents[tone];

  /* The headline is whichever milestone the item is actually sitting on — the
     live one if something is still in motion, otherwise the last one reached. */
  const marker =
    journey.find((node) => node.state === "current") ??
    journey.findLast(
      (node) => node.state === "done" || node.state === "failed",
    ) ??
    journey[0];

  const description = detail ? returnStatus(detail.status).description : "";
  const reason = detail?.lineItemReasons[item.id] ?? null;
  const price = item.totalPrice
    ? formatMoney(item.totalPrice.amount, item.totalPrice.currencyCode)
    : "";

  const status = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.62rem] font-semibold tracking-[0.12em] uppercase",
        accent.chip,
      )}
    >
      <Icon
        name={glyphFor(detail !== null, group.fulfillment?.status ?? null)}
        className="size-3"
        strokeWidth={2.4}
      />
      {marker?.label}
    </span>
  );

  const thumb = (size: string) =>
    item.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image.url}
        alt={item.image.altText ?? ""}
        className={cn("shrink-0 bg-parchment object-cover", size)}
      />
    ) : (
      <span
        className={cn(
          "grid shrink-0 place-items-center bg-parchment text-ink-mute",
          size,
        )}
      >
        <Icon name="bag" className="size-5" />
      </span>
    );

  const meta = [
    price,
    `Qty ${item.quantity}`,
    marker?.at ? shortDate(marker.at) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const face = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1 bg-linear-to-b",
          accent.edge,
        )}
      />

      <Icon
        name="chevron-right"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-mute sm:hidden"
        strokeWidth={2}
      />

      <span className="flex min-h-18 items-center gap-3.5 py-3.5 pr-2 pl-2 sm:pl-6">
        {thumb("size-14 rounded-xl sm:size-12")}

        <span className="min-w-0 flex-1 pr-4 sm:pr-0">
          <span className="line-clamp-2 block text-sm leading-snug font-medium text-ink sm:line-clamp-1">
            {item.title}
          </span>

          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {status}
            {marker?.at && (
              <span className="hidden text-[0.68rem] text-ink-mute sm:inline">
                {shortDate(marker.at)}
              </span>
            )}
          </span>

          <span className="mt-1.5 block text-[0.7rem] text-ink-mute sm:hidden">
            {meta}
          </span>
        </span>

        <span className="hidden shrink-0 text-right sm:block">
          <span className="block text-sm font-medium text-ink">{price}</span>
          <span className="block text-[0.68rem] text-ink-mute">
            ×{item.quantity}
          </span>
        </span>

        <Icon
          name="arrow-right"
          className="hidden size-4 shrink-0 text-ink-mute transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 group-hover:text-ink sm:block"
        />
      </span>
    </>
  );

  return (
    <ItemStatusPanel face={face} label={item.title}>
      <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        {/* On a phone this is the sheet's header; from md up it becomes the
            dialog's left column — a quiet panel the timeline reads against. */}
        <div className="shrink-0 border-line px-5 pt-4 pb-5 md:border-r md:bg-parchment md:px-7 md:py-8">
          <div className="flex items-start gap-4 md:flex-col md:gap-5">
            {thumb(
              "size-14 rounded-xl md:size-auto md:aspect-square md:w-full md:rounded-(--radius-card)",
            )}
            <div className="min-w-0">
              <p className="font-display font-semibold text-ink md:text-lg">
                {item.title}
              </p>
              {item.variantTitle && item.variantTitle !== "Default Title" && (
                <p className="mt-0.5 text-xs text-ink-mute">
                  {item.variantTitle}
                </p>
              )}
              <p className="mt-2 text-sm text-ink-soft">
                {price ? `${price} · ` : ""}Qty {item.quantity}
              </p>
              {item.sku && (
                <p className="mt-1 text-xs text-ink-mute">{item.sku}</p>
              )}
            </div>
          </div>

          <div className="mt-4 md:mt-6">{status}</div>
        </div>

        {/* The timeline is the only part that scrolls, so the product stays
            put while a long history moves under it. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-7 md:px-8 md:py-8">
          <h3 className="font-display text-lg font-bold text-ink uppercase">
            Tracking
          </h3>
          <p className="mt-1.5 text-sm text-ink-mute">
            from our door to your floor
          </p>

          <VerticalJourney nodes={journey} />

          {(description || reason || detail?.tracking?.number) && (
            <dl className="mt-7 space-y-4 border-t border-line pt-5 text-sm">
              {description && (
                <div>
                  <dd className="leading-relaxed text-ink-soft">
                    {description}
                  </dd>
                </div>
              )}
              {reason && (
                <div>
                  <dt className="text-[0.62rem] font-semibold tracking-[0.24em] text-ink-mute uppercase">
                    Reason
                  </dt>
                  <dd className="mt-1.5 text-ink">
                    {returnReasonLabel(reason)}
                  </dd>
                </div>
              )}
              {detail?.tracking?.number && (
                <div>
                  <dt className="text-[0.62rem] font-semibold tracking-[0.24em] text-ink-mute uppercase">
                    Return tracking
                  </dt>
                  <dd className="mt-1.5">
                    {detail.tracking.url ? (
                      <Link
                        href={detail.tracking.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink underline underline-offset-4 hover:text-ink-soft"
                      >
                        {detail.tracking.number}
                      </Link>
                    ) : (
                      <span className="text-ink">{detail.tracking.number}</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </ItemStatusPanel>
  );
}

/* ── Vertical timeline ─────────────────────────────────────────────────── */

const labelColor: Record<JourneyState, string> = {
  done: "text-ink",
  current: "text-slate-700",
  failed: "text-red-700",
  pending: "text-ink-mute",
};

/** Milestones oldest to newest down a single spine. */
function VerticalJourney({ nodes }: { nodes: JourneyNode[] }) {
  return (
    <ol className="mt-6">
      {nodes.map((node, i) => {
        const isLast = i === nodes.length - 1;
        return (
          <li key={node.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Spine down to the next milestone. */}
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute top-5 bottom-0 left-1.75 w-0.5 overflow-hidden rounded-full bg-line"
              >
                <Spine state={nodes[i + 1]?.state} />
              </span>
            )}

            <span className="relative z-10 mt-0.5">
              <Dot state={node.state} />
            </span>

            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", labelColor[node.state])}>
                {node.label}
              </p>
              {node.at && (
                <p className="mt-0.5 text-xs text-ink-mute">
                  {shortDate(node.at)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The leg between two milestones: filled once reached, flowing while live. */
function Spine({ state }: { state: JourneyState | undefined }) {
  if (state === "done") {
    return <span className="block h-full bg-emerald-500" />;
  }
  if (state === "failed") {
    return <span className="block h-full bg-red-400" />;
  }
  if (state === "current") {
    return <span className="block h-3/5 animate-pulse bg-slate-400" />;
  }
  return null;
}

function Dot({ state }: { state: JourneyState }) {
  if (state === "current") {
    return (
      <span className="relative grid size-4 place-items-center rounded-full bg-slate-500 ring-[3px] ring-slate-100">
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-slate-500 opacity-40 motion-reduce:hidden"
        />
        <span className="relative size-1.5 rounded-full bg-ivory" />
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span className="grid size-4 place-items-center rounded-full bg-red-500 text-white ring-[3px] ring-red-100">
        <Icon name="close" className="size-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (state === "pending") {
    return (
      <span className="grid size-4 place-items-center rounded-full border border-dashed border-ink-mute/50 bg-ivory">
        <span className="size-1 rounded-full bg-line" />
      </span>
    );
  }
  return (
    <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-ink ring-[3px] ring-emerald-500/25">
      <Icon name="check" className="size-2.5" strokeWidth={3} />
    </span>
  );
}
