import { NextResponse } from "next/server";
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
    return NextResponse.json({ reason: "No variant selected." }, { status: 400 });
  }

  const checkoutUrl = await createCheckout(body.variantId, body.quantity ?? 1);

  if (!checkoutUrl) {
    return NextResponse.json(
      { reason: "We could not reach checkout. Please try again in a moment." },
      { status: 502 },
    );
  }

  return NextResponse.json({ checkoutUrl });
}
