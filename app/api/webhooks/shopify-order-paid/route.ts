import { NextRequest, NextResponse } from "next/server";

import { syncedProducts } from "@/lib/catalog";
import {
  isDuplicateWebhook,
  verifyWebhookSignature,
} from "@/services/webhooks/verify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Shopify `orders/paid` webhook — the only place this site can learn that a
 * purchase actually happened, because the shopper pays on Shopify's hosted
 * checkout domain and never returns to a client-side success page here.
 *
 * The handler verifies Shopify's HMAC, then forwards the order to the
 * server-side conversion endpoints that need a real conversion signal:
 *   • Meta Conversions API (`Purchase`) — the browser pixel cannot see this
 *   • Google Analytics 4 Measurement Protocol (`purchase`)
 *
 * Both providers are optional: a missing env config is skipped silently and
 * the webhook still acks Shopify with 200 so it does not retry.
 */

type ShopifyLineItem = {
  id: number;
  product_id?: number | null;
  variant_id?: number | null;
  quantity?: number;
  price?: string | number;
  title?: string;
};

type ShopifyOrder = {
  id: number;
  name?: string;
  currency?: string;
  total_price?: string | number;
  current_total_price?: string | number;
  line_items?: ShopifyLineItem[];
};

/* Numeric tails of our catalogue ids — Shopify webhooks send plain numbers,
   while the Storefront/Admin APIs return `gid://shopify/…/123` strings.
   Across every product this storefront sells, not just one. */
const productIdNums = new Set(
  syncedProducts.map((p) => p.id.split("/").pop()),
);
const variantIdNums = new Set(
  syncedProducts.flatMap((p) => p.variants.map((v: { id: string }) => v.id.split("/").pop())),
);

/** True when a webhook line item belongs to HimVolt (shared store). */
function isOurLineItem(line: ShopifyLineItem): boolean {
  if (line.product_id != null && productIdNums.has(String(line.product_id))) {
    return true;
  }
  return line.variant_id != null && variantIdNums.has(String(line.variant_id));
}

const ack = () => NextResponse.json({ received: true });

/** Meta Conversions API `Purchase` event. No-op without a pixel + access token. */
async function sendMetaPurchase(
  order: ShopifyOrder,
  ip: string | null,
  userAgent: string | null,
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v21.0";
  if (!pixelId || !accessToken) return;

  const items = (order.line_items ?? []).filter(isOurLineItem);
  if (items.length === 0) return;

  const value = Number(order.current_total_price ?? order.total_price ?? 0);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: `purchase-${order.id}`,
              action_source: "website",
              user_data: {
                client_ip_address: ip ?? undefined,
                client_user_agent: userAgent ?? undefined,
              },
              custom_data: {
                currency: order.currency ?? "USD",
                value,
                content_ids: items.map((i) => String(i.variant_id ?? i.id)),
                content_type: "product",
                num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
                order_id: String(order.id),
              },
            },
          ],
        }),
      },
    );
    const text = await response.text();
    console.log(
      `[webhook] Meta CAPI status ${response.status} for order ${order.id}: ${text.slice(0, 500)}`,
    );
  } catch (error) {
    console.error(
      `[webhook] Meta CAPI request failed for order ${order.id}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

/** GA4 Measurement Protocol `purchase` event. No-op without an API secret. */
async function sendGa4Purchase(order: ShopifyOrder): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_MP_API_SECRET;
  if (!measurementId || !apiSecret) return;

  const items = (order.line_items ?? []).filter(isOurLineItem).map((line) => ({
    item_id: String(line.variant_id ?? line.id),
    item_name: line.title ?? "",
    price: Number(line.price ?? 0),
    quantity: line.quantity ?? 1,
  }));
  if (items.length === 0) return;

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?api_secret=${encodeURIComponent(apiSecret)}&measurement_id=${encodeURIComponent(measurementId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          /* One stable server-side client per order, so the purchase is not
             counted as its own brand-new "user". */
          client_id: `order-${order.id}.himvolt`,
          events: [
            {
              name: "purchase",
              params: {
                currency: order.currency ?? "USD",
                value: Number(
                  order.current_total_price ?? order.total_price ?? 0,
                ),
                transaction_id: String(order.id),
                items,
              },
            },
          ],
        }),
      },
    );
    const text = await response.text();
    console.log(
      `[webhook] GA4 MP status ${response.status} for order ${order.id}: ${text.slice(0, 500)}`,
    );
  } catch (error) {
    console.error(
      `[webhook] GA4 MP request failed for order ${order.id}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (
    !verifyWebhookSignature(
      rawBody,
      request.headers.get("x-shopify-hmac-sha256"),
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Shopify retries and can re-deliver the same event; dedupe on the webhook
  // id so a purchase is never counted twice in Meta / GA4.
  if (isDuplicateWebhook(request.headers.get("x-shopify-webhook-id"))) {
    return ack();
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(rawBody) as ShopifyOrder;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Fire both analytics beacons in parallel and let them fail independently.
  await Promise.allSettled([
    sendMetaPurchase(
      order,
      request.headers.get("x-forwarded-for"),
      request.headers.get("user-agent"),
    ),
    sendGa4Purchase(order),
  ]);

  return ack();
}
