"use client";

/**
 * Client-side analytics helpers — one call fires the matching event to every
 * configured provider (Meta Pixel via `fbq`, Google Analytics 4 via `gtag`,
 * TikTok Pixel via `ttq`).
 *
 * No provider is ever required: the snippets in MetaPixel / GoogleAnalytics /
 * TikTokPixel only install `window.fbq` / `window.gtag` / `window.ttq` when
 * their env var is set, so the optional calls below are silent no-ops on
 * local runs and previews without the ids. Event names are each platform's
 * own standard ecommerce vocabulary so all three line up on the same funnel.
 * The `Purchase` / `purchase` event is intentionally not here — it's sent
 * server-side from the Shopify `orders/paid` webhook
 * (app/api/webhooks/shopify-order-paid/route.ts), since the shopper pays on
 * Shopify's hosted checkout domain and never returns to a client-side
 * success page this app controls.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    ttq?: {
      page: (...args: unknown[]) => void;
      track: (...args: unknown[]) => void;
    };
  }
}

/** A catalogue line as both pixels understand it. Carries its own price so a
 *  multi-item cart with different-priced lines totals correctly. */
export type AnalyticsItem = {
  slug: string;
  /** The product's id in Meta's catalog (lib/meta-ids.ts). Falls back to `slug`. */
  metaId?: string;
  name: string;
  /** Price for one unit, in integer cents (e.g. 2999 for $29.99). */
  priceCents: number;
  quantity?: number;
};

const META_PIXEL_ENABLED = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);

/** A fresh id per event. Tags the pixel call so a server-side relay of the same event can be de-duplicated against it. */
function eventId(event: string) {
  return `${event}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function fbq(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !META_PIXEL_ENABLED) return;
  const eventID = eventId(event);
  const send = () => window.fbq?.("track", event, data, { eventID });
  if (window.fbq) return send();
  // The pixel snippet installs `window.fbq` shortly after hydration; an event
  // fired before then (an instant add-to-cart) would otherwise vanish.
  let tries = 0;
  const timer = window.setInterval(() => {
    if (window.fbq) {
      window.clearInterval(timer);
      send();
    } else if (++tries >= 40) {
      window.clearInterval(timer);
    }
  }, 250);
}

/** Meta `content_ids` + `contents`: one entry per catalog product, quantities summed across variants of it. */
function metaContents(items: AnalyticsItem[]) {
  const byId = new Map<string, { id: string; quantity: number; item_price: number }>();
  for (const item of items) {
    const id = item.metaId ?? item.slug;
    const quantity = item.quantity ?? 1;
    const existing = byId.get(id);
    if (existing) {
      // Keep item_price a per-unit average so price × quantity stays the line total.
      const total = existing.item_price * existing.quantity + (item.priceCents / 100) * quantity;
      existing.quantity += quantity;
      existing.item_price = Math.round((total / existing.quantity) * 100) / 100;
    } else {
      byId.set(id, { id, quantity, item_price: item.priceCents / 100 });
    }
  }
  const contents = [...byId.values()];
  return { content_ids: contents.map((c) => c.id), contents };
}

function gtag(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
}

function ttq(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.ttq?.track(event, data);
}

/** priceCents (int) + quantity → the amount the shopper pays, in the unit currency. */
function lineValue(item: AnalyticsItem): number {
  return Math.round(item.priceCents * (item.quantity ?? 1)) / 100;
}

/** GA4 enhanced-ecommerce item array. */
function toGtagItems(items: AnalyticsItem[]) {
  return items.map((item) => ({
    item_id: item.slug,
    item_name: item.name,
    price: item.priceCents / 100,
    quantity: item.quantity ?? 1,
  }));
}

/** Product page view — Meta `ViewContent`, GA4 `view_item`. */
export function trackViewContent(item: AnalyticsItem, currency: string) {
  const value = lineValue(item);
  fbq("ViewContent", {
    content_type: "product",
    ...metaContents([item]),
    content_name: item.name,
    currency,
    value,
  });
  gtag("view_item", {
    currency,
    value,
    items: toGtagItems([item]),
  });
  ttq("ViewContent", {
    content_type: "product",
    content_id: item.slug,
    content_name: item.name,
    quantity: item.quantity ?? 1,
    currency,
    value,
    // TikTok's Shop/catalog matching (Video Shopping Ads eligibility, the
    // Content ID diagnostic) reads content_id from this array, not the flat
    // field above — both are sent so older and newer TikTok tooling agree.
    contents: [{ content_id: item.slug, content_name: item.name }],
  });
}

/** Item added to the bag — Meta `AddToCart`, GA4 `add_to_cart`. */
export function trackAddToCart(item: AnalyticsItem, currency: string) {
  const value = lineValue(item);
  fbq("AddToCart", {
    content_type: "product",
    ...metaContents([item]),
    content_name: item.name,
    currency,
    value,
  });
  gtag("add_to_cart", {
    currency,
    value,
    items: toGtagItems([item]),
  });
  ttq("AddToCart", {
    content_type: "product",
    content_id: item.slug,
    content_name: item.name,
    quantity: item.quantity ?? 1,
    currency,
    value,
    contents: [
      { content_id: item.slug, content_name: item.name, quantity: item.quantity ?? 1 },
    ],
  });
}

/** Checkout started — Meta `InitiateCheckout`, GA4 `begin_checkout`. */
export function trackInitiateCheckout(
  items: AnalyticsItem[],
  currency: string,
) {
  const value = items.reduce((sum, item) => sum + lineValue(item), 0);
  fbq("InitiateCheckout", {
    content_type: "product",
    ...metaContents(items),
    num_items: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    currency,
    value,
  });
  gtag("begin_checkout", {
    currency,
    value,
    items: toGtagItems(items),
  });
  ttq("InitiateCheckout", {
    content_type: "product",
    contents: items.map((item) => ({
      content_id: item.slug,
      content_name: item.name,
      quantity: item.quantity ?? 1,
    })),
    currency,
    value,
  });
}
