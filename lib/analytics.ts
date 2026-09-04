"use client";

/**
 * Client-side analytics helpers — one call fires the matching event to every
 * configured provider (Meta Pixel via `fbq`, Google Analytics 4 via `gtag`).
 *
 * No provider is ever required: the snippets in MetaPixel / GoogleAnalytics
 * only install `window.fbq` / `window.gtag` when their env var is set, so the
 * optional calls below are silent no-ops on local runs and previews without
 * the ids. Event names are the standard Meta Pixel and GA4 enhanced-ecommerce
 * vocabulary so both platforms line up on the same funnel. The `Purchase` /
 * `purchase` event is intentionally not here — it's sent server-side from the
 * Shopify `orders/paid` webhook (app/api/webhooks/shopify-order-paid/route.ts),
 * since the shopper pays on Shopify's hosted checkout domain and never returns
 * to a client-side success page this app controls.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** A catalogue line as both pixels understand it. Carries its own price so a
 *  multi-item cart with different-priced lines totals correctly. */
export type AnalyticsItem = {
  slug: string;
  name: string;
  /** Price for one unit, in integer cents (e.g. 2999 for $29.99). */
  priceCents: number;
  quantity?: number;
};

function fbq(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, data);
}

function gtag(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
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
    content_ids: [item.slug],
    content_name: item.name,
    currency,
    value,
  });
  gtag("view_item", {
    currency,
    value,
    items: toGtagItems([item]),
  });
}

/** Item added to the bag — Meta `AddToCart`, GA4 `add_to_cart`. */
export function trackAddToCart(item: AnalyticsItem, currency: string) {
  const value = lineValue(item);
  fbq("AddToCart", {
    content_type: "product",
    content_ids: [item.slug],
    content_name: item.name,
    currency,
    value,
  });
  gtag("add_to_cart", {
    currency,
    value,
    items: toGtagItems([item]),
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
    content_ids: items.map((item) => item.slug),
    num_items: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    currency,
    value,
  });
  gtag("begin_checkout", {
    currency,
    value,
    items: toGtagItems(items),
  });
}
