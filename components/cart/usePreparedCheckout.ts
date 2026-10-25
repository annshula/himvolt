"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  createCheckout,
  type CheckoutLine,
  type ShopifyCheckoutResult,
} from "@/lib/shopify-checkout";

/** Wait for the stepper to settle before creating a cart for the bag. */
const SETTLE_MS = 250;

/** Lets the browser open the TLS connection to checkout before the redirect. */
function preconnect(url: string) {
  try {
    const origin = new URL(url).origin;
    if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`))
      return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    document.head.appendChild(link);
  } catch {
    // A malformed URL only costs the head start.
  }
}

/**
 * Creates the Shopify checkout while the shopper is looking at the bag, so
 * the Checkout click is a redirect instead of a wait on our API route and two
 * Shopify round-trips. A prepared checkout belongs to one exact bag (variant
 * and quantity per line); any change prepares a new one, and a click on a
 * bag whose checkout isn't ready yet joins the request already in flight
 * instead of starting another.
 *
 * Returns `open()`: the checkout URL for the bag as it is now. A prepared
 * attempt that failed is retried once, live, so a blip while preparing never
 * becomes the shopper's error.
 */
export function usePreparedCheckout(lines: CheckoutLine[], enabled: boolean) {
  const key = lines.map((l) => `${l.variantId}*${l.qty}`).join("|");
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const prepared = useRef<{
    key: string;
    promise: Promise<ShopifyCheckoutResult>;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !key || prepared.current?.key === key) return;
    const timer = window.setTimeout(() => {
      // A click during the settle window already started this bag's checkout.
      if (prepared.current?.key === key) return;
      const promise = createCheckout(linesRef.current);
      prepared.current = { key, promise };
      void promise.then((result) => {
        if (result.ok) preconnect(result.checkoutUrl);
        else if (prepared.current?.promise === promise) prepared.current = null;
      });
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [key, enabled]);

  return useCallback(async (): Promise<ShopifyCheckoutResult> => {
    const ahead =
      prepared.current?.key === key ? prepared.current.promise : null;
    if (ahead) {
      const result = await ahead;
      if (result.ok) return result;
    }
    const fresh = createCheckout(linesRef.current);
    prepared.current = { key, promise: fresh };
    return fresh;
  }, [key]);
}
