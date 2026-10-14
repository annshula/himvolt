import "server-only";

import { resolveEffectiveCountry } from "@/lib/localization/country";
import { getLocalization } from "@/lib/shopify/localization-service";

/**
 * The country Shopify will actually price this visitor in — the one value
 * both the live price API and checkout must agree on.
 *
 * `resolveEffectiveCountry()` gives the visitor's choice or their GeoIP
 * country, but Shopify only prices countries it has a market for; an
 * unsupported one resolves to the shop's default market. The page's prices
 * come from `localization.country` (see /api/localization), so checkout asks
 * the same question and uses the same answer, rather than passing a raw
 * header value Shopify might reject or price differently.
 *
 * Returns null when no country is known (no GeoIP header, e.g. localhost):
 * Shopify's own default market then applies on both sides.
 */
export async function resolvePricingCountry(): Promise<string | null> {
  const raw = await resolveEffectiveCountry();
  if (!raw || !/^[A-Z]{2}$/.test(raw)) return null;
  try {
    const { defaultCountry } = await getLocalization(raw);
    return defaultCountry.isoCode;
  } catch {
    // Shopify unreachable: fall back to the raw country rather than none.
    return raw;
  }
}
