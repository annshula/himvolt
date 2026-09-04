/**
 * Client helper for kicking off a Shopify-hosted checkout from the current
 * bag. The actual Storefront cart is created server-side (no tokens in the
 * browser); this only calls the API route and navigates to the checkout URL.
 *
 * Fires `InitiateCheckout`/`begin_checkout` itself, once, right here — every
 * caller (BuyBox's "Buy it now", the cart drawer, /checkout's "Pay now") goes
 * through this one function, so the event can never be missed at a call site
 * or double-fired by two of them tracking the same checkout separately.
 */

import { resolveCartLine } from "@/lib/cart-catalog";
import { trackInitiateCheckout } from "@/lib/analytics";

export type ShopifyCheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string };

export async function shopifyCheckout(
  lines: Array<{ variantId: string; qty: number; priceCents?: number }>,
  currency = "USD",
): Promise<ShopifyCheckoutResult> {
  try {
    const res = await fetch("/api/shopify/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: lines.map(({ variantId, qty }) => ({ variantId, qty })),
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      checkoutUrl?: string;
      error?: string;
    };
    if (data.ok && data.checkoutUrl) {
      const items = lines
        .map((line) => {
          const catalog = resolveCartLine(line.variantId);
          if (!catalog) return null;
          return {
            slug: line.variantId,
            name: catalog.name,
            priceCents: line.priceCents ?? catalog.unitPriceCents,
            quantity: line.qty,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
      if (items.length > 0) {
        trackInitiateCheckout(items, currency);
      }
      return { ok: true, checkoutUrl: data.checkoutUrl };
    }
    return { ok: false, error: data.error ?? "We could not start checkout." };
  } catch {
    return { ok: false, error: "We could not reach checkout right now." };
  }
}
