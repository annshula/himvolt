import { NextRequest, NextResponse } from "next/server";

import {
  MAX_ENTRIES,
  MAX_KEY_LENGTH,
  MAX_VALUE_LENGTH,
} from "@/lib/attribution";
import { getVariantById } from "@/lib/catalog";
import { resolvePricingCountry } from "@/lib/localization/resolve";
import { shipCountryFor } from "@/lib/localization/ship-country";
import { isStorefrontConfigured, shopifyConfig } from "@/lib/shopify/config";
import { createCart } from "@/lib/shopify/storefront";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CartLine = { variantId?: string; qty?: number };

/**
 * Ad-click params from the browser, reduced to bounded plain-string pairs
 * before they become Shopify cart attributes (client input is untrusted).
 */
function cartAttributes(raw: unknown): Array<{ key: string; value: string }> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const attributes: Array<{ key: string; value: string }> = [];
  for (const [key, value] of Object.entries(raw)) {
    if (attributes.length >= MAX_ENTRIES) break;
    if (!key || key.length > MAX_KEY_LENGTH) continue;
    if (typeof value !== "string" || !value.trim()) continue;
    attributes.push({ key, value: value.trim().slice(0, MAX_VALUE_LENGTH) });
  }
  return attributes;
}

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
    attribution?: unknown;
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
    // The same country the on-page prices were fetched for (the visitor's own
    // choice, else the edge-detected one), so Shopify prices the cart in the
    // same market and currency the bag displayed.
    // A product limited to some countries is unavailable in any other
    // country's context, so such a bag is checked out for a country it ships
    // to (see shipCountryFor) rather than opening on "Out of stock".
    const countryCode = shipCountryFor(
      cartLines.map((l) => l.merchandiseId),
      await resolvePricingCountry(),
    );
    const cart = await createCart(cartLines, {
      countryCode,
      attributes: cartAttributes(body?.attribution),
    });
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
