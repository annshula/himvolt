import { NextRequest, NextResponse } from "next/server";

import { getVariantById } from "@/lib/catalog";
import { isStorefrontConfigured, shopifyConfig } from "@/lib/shopify/config";
import { createCart } from "@/lib/shopify/storefront";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CartLine = { variantId?: string; qty?: number };

/**
 * Builds a Shopify Storefront cart from the current bag lines and returns the
 * hosted checkout URL. The client navigates to it — Shopify owns the rest of
 * the purchase flow.
 */
export async function POST(request: NextRequest) {
  if (!isStorefrontConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Shopify checkout is not connected yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    lines?: CartLine[];
  } | null;
  const lines = Array.isArray(body?.lines) ? body.lines : [];
  if (lines.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Your bag is empty." },
      { status: 400 },
    );
  }

  const cartLines = lines
    .map((line) => {
      if (!line.variantId) return null;
      const variant = getVariantById(line.variantId);
      if (!variant || !variant.availableForSale) return null;
      const qty = Math.max(1, Math.min(Number(line.qty) || 1, 20));
      return { merchandiseId: variant.id, quantity: qty };
    })
    .filter(
      (l): l is { merchandiseId: string; quantity: number } => l !== null,
    );

  if (cartLines.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "We could not match the items in your bag to the store.",
      },
      { status: 400 },
    );
  }

  try {
    const cart = await createCart(cartLines);
    // After a successful payment Shopify redirects the shopper back here,
    // where the local bag is cleared (see /checkout/confirmation).
    const returnTo = `${shopifyConfig().siteUrl}/checkout/confirmation`;
    const checkoutUrl = new URL(cart.checkoutUrl);
    checkoutUrl.searchParams.set("return_to", returnTo);
    return NextResponse.json({
      ok: true,
      checkoutUrl: checkoutUrl.toString(),
      totalQuantity: cart.totalQuantity,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "We could not create your checkout.",
      },
      { status: 500 },
    );
  }
}
