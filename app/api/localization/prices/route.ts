import { NextResponse } from "next/server";

import { getVariantById } from "@/lib/catalog";
import { resolvePricingCountry } from "@/lib/localization/resolve";
import { shipCountryFor } from "@/lib/localization/ship-country";
import { getLocalizedVariantPrices } from "@/lib/shopify/localization-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VARIANT_ID_RE = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const COUNTRY_CODE_RE = /^[A-Z]{2}$/;

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow" },
  });

/**
 * POST /api/localization/prices
 *
 * Given a batch of variant IDs, returns each one's price *as Shopify itself
 * reports it* for the visitor's country — no conversion happens in this app.
 * The country is the one the request names (the client is the source of truth
 * for what the shopper is looking at right now: the cookie write that follows
 * a country switch is a separate request, so reading only the cookie here
 * would race it), falling back to the visitor's effective country (their
 * saved choice, else the edge-detected one).
 *
 * Only variants that belong to HimVolt's own synced catalog are accepted —
 * the store is shared with other brands.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const input = (body as { variantIds?: unknown })?.variantIds;
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.length > 60 ||
    input.some((id) => typeof id !== "string" || !VARIANT_ID_RE.test(id))
  ) {
    return json({ error: "Invalid variant ids." }, 400);
  }

  const ids = (input as string[]).filter((id) => getVariantById(id) !== null);
  if (ids.length === 0) return json({ prices: {} });

  const requested = (body as { country?: unknown })?.country;
  const country =
    typeof requested === "string" && COUNTRY_CODE_RE.test(requested)
      ? requested
      : await resolvePricingCountry();
  if (!country) return json({ prices: {} });

  // Prices follow checkout: a product limited to some countries is checked
  // out for a country it ships to, so it is priced there too (the bag then
  // never shows one currency and charges another).
  const priceCountry = shipCountryFor(ids, country) ?? country;

  try {
    const priceMap = await getLocalizedVariantPrices(ids, priceCountry);
    return json({ prices: Object.fromEntries(priceMap), country: priceCountry });
  } catch {
    // A failed live-price fetch should never break the page — callers fall
    // back to the base price already shown.
    return json({ prices: {} });
  }
}
