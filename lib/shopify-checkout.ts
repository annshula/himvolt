/**
 * Client helper for kicking off a Shopify-hosted checkout from the current
 * bag. The actual Storefront cart is created server-side (no tokens in the
 * browser); this only calls the API route and navigates to the checkout URL.
 *
 * Creating the checkout and tracking it are separate steps: the bag creates
 * one ahead of time (see usePreparedCheckout) so the click only redirects,
 * and a checkout made ahead must not count as `InitiateCheckout` until the
 * shopper actually clicks. `shopifyCheckout` does both, for a caller that
 * has nothing prepared.
 */

import { resolveCartLine } from "@/lib/cart-catalog";
import { trackInitiateCheckout } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";

export type ShopifyCheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string };

export type CheckoutLine = {
  variantId: string;
  qty: number;
  priceCents?: number;
};

/** Creates the Shopify cart and returns its checkout URL. Fires no analytics. */
export async function createCheckout(
  lines: CheckoutLine[],
): Promise<ShopifyCheckoutResult> {
  try {
    const res = await fetch("/api/shopify/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: lines.map(({ variantId, qty }) => ({ variantId, qty })),
        attribution: getAttribution(),
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      checkoutUrl?: string;
      error?: string;
    };
    if (data.ok && data.checkoutUrl) {
      return { ok: true, checkoutUrl: data.checkoutUrl };
    }
    return { ok: false, error: data.error ?? "We could not start checkout." };
  } catch {
    return { ok: false, error: "We could not reach checkout right now." };
  }
}

/** `InitiateCheckout`/`begin_checkout`, once per click that reaches checkout. */
export function trackCheckout(lines: CheckoutLine[], currency = "USD") {
  const items = lines
    .map((line) => {
      const catalog = resolveCartLine(line.variantId);
      if (!catalog) return null;
      return {
        slug: line.variantId,
        metaId: catalog.metaId,
        name: catalog.name,
        priceCents: line.priceCents ?? catalog.unitPriceCents,
        quantity: line.qty,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  if (items.length > 0) {
    trackInitiateCheckout(items, currency);
  }
}

export async function shopifyCheckout(
  lines: CheckoutLine[],
  currency = "USD",
): Promise<ShopifyCheckoutResult> {
  const result = await createCheckout(lines);
  if (result.ok) trackCheckout(lines, currency);
  return result;
}
