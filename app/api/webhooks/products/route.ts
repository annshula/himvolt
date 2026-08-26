import { NextRequest, NextResponse } from "next/server";

import { isAdminConfigured } from "@/lib/shopify/config";
import { syncProductFromWebhook } from "@/lib/shopify/sync-product";
import {
  isDuplicateWebhook,
  verifyWebhookSignature,
} from "@/services/webhooks/verify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Shopify `products/create` + `products/update` webhooks — keeps the synced
 * catalog (data/product.json) current when a product is added or edited in
 * Shopify Admin, so a merchant's title/price/images/metafield changes show up
 * on the storefront without re-running `npm run shopify:sync` or POST
 * /api/admin/sync-product by hand.
 *
 * Verified via Shopify's HMAC against SHOPIFY_WEBHOOK_SECRET, deduped on the
 * webhook id, then handed to syncProductFromWebhook(): a product already in
 * the file is refreshed in place; a brand-new id is seeded into the file and
 * then synced ("Exactly the SKUs" — only the exact id the webhook named is
 * ever added, never a title/SKU search).
 */

const PRODUCT_TOPICS = new Set(["products/create", "products/update"]);

const ack = () => NextResponse.json({ received: true });

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

  const topic = request.headers.get("x-shopify-topic");
  if (!topic || !PRODUCT_TOPICS.has(topic)) {
    // Not ours (e.g. products/delete) — ack so Shopify doesn't retry.
    return ack();
  }

  // Shopify retries and can re-deliver the same event; dedupe on the webhook
  // id so a create/update is never synced twice.
  if (isDuplicateWebhook(request.headers.get("x-shopify-webhook-id"))) {
    return ack();
  }

  let payload: { id?: number | string; title?: string; handle?: string };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.id === undefined || payload.id === null) {
    console.error(`[webhook/products] ${topic} payload missing product id`);
    return ack();
  }

  // Graceful when the Admin API isn't configured — same as the orders handler
  // skipping analytics providers: ack so Shopify doesn't hammer a config
  // error that a retry can never fix.
  if (!isAdminConfigured()) {
    console.error(
      "[webhook/products] Admin API not configured — skipping sync (set SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET or SHOPIFY_ADMIN_API_TOKEN).",
    );
    return ack();
  }

  try {
    const result = await syncProductFromWebhook(payload.id, {
      title: payload.title,
      handle: payload.handle,
    });
    console.log(
      `[webhook/products] ${topic} → ${result.action} (${result.handle ?? payload.id}), ${result.products} products in catalog`,
    );
    return NextResponse.json({ received: true, topic, ...result });
  } catch (error) {
    console.error(
      `[webhook/products] ${topic} sync failed:`,
      error instanceof Error ? error.message : error,
    );
    // 500 so Shopify retries — a transient Admin API hiccup shouldn't leave
    // the catalog stale forever.
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
