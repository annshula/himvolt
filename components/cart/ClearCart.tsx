"use client";

import { useEffect } from "react";

import { useCart } from "@/components/providers/CartProvider";

/**
 * Empties the local bag once, on mount.
 *
 * Mounted by the post-payment confirmation page. Shopify redirects the shopper
 * there after a successful checkout (the `return_to` on the checkout URL), so
 * this is the moment the purchase is actually complete — not the moment the
 * shopper leaves for Shopify's hosted checkout.
 */
export function ClearCart() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
