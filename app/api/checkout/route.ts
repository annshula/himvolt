import { NextResponse } from "next/server";

import { getVariantById } from "@/lib/catalog";
import { createCheckout, shopifyEnabled } from "@/lib/shopify";

export const runtime = "edge";

/**
 * Creates a Shopify cart and hands back its hosted checkout URL.
 * Returns `{ reason }` instead of throwing while the store is not yet wired,
 * so the UI can say something true to the customer.
 */
export async function POST(request: Request) {
  if (!shopifyEnabled) {
    return NextResponse.json(
      {
        reason:
          "Checkout opens shortly — the store is in final testing. Email support@himvolt.com and we will hold one for you.",
      },
      { status: 200 },
    );
  }

  let body: { variantId?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ reason: "Malformed request." }, { status: 400 });
  }

  if (!body.variantId) {
    return NextResponse.json(
      { reason: "No variant selected." },
      { status: 400 },
    );
  }

  // Same catalog/availability validation as /api/shopify/cart — reject unknown
  // or out-of-stock variants instead of handing an unbounded primitive to
  // Shopify's cartCreate.
  const variant = getVariantById(body.variantId);
  if (!variant || !variant.availableForSale) {
    return NextResponse.json(
      { reason: "This item is not available for purchase right now." },
      { status: 400 },
    );
  }

  const quantity = Math.max(1, Math.min(Number(body.quantity) || 1, 20));
  const checkoutUrl = await createCheckout(body.variantId, quantity);

  if (!checkoutUrl) {
    return NextResponse.json(
      { reason: "We could not reach checkout. Please try again in a moment." },
      { status: 502 },
    );
  }

  return NextResponse.json({ checkoutUrl });
}
