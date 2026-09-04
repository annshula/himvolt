"use client";

import { useEffect, useRef } from "react";

import { useLocalizedAmount } from "@/components/providers/LocalizationProvider";
import { trackViewContent } from "@/lib/analytics";

/**
 * Fires Meta `ViewContent` / GA4 `view_item` once per product page view, using
 * the live localized price so the event value matches what the shopper sees.
 * Only fires after the localized price settles (`pending` false); a `fired`
 * ref then blocks any further fire for the life of this mount — a plain
 * empty-deps effect would fire twice under React 18 Strict Mode in dev, and
 * would refire if the localization provider re-resolves `pending` later.
 */
export function ProductViewTracker({
  variantId,
  name,
  fallbackAmount,
  fallbackCurrency,
}: {
  variantId: string;
  name: string;
  fallbackAmount: number;
  fallbackCurrency: string;
}) {
  const { amount, currencyCode, pending } = useLocalizedAmount(
    variantId,
    fallbackAmount,
    fallbackCurrency,
    null,
  );
  const fired = useRef(false);

  useEffect(() => {
    if (pending || fired.current) return;
    fired.current = true;
    trackViewContent(
      { slug: variantId, name, priceCents: Math.round(amount * 100) },
      currencyCode,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return null;
}
