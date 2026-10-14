import { NextRequest, NextResponse } from "next/server";

import {
  COUNTRY_SELECTOR_ENABLED,
  clearSelectedCountry,
  readSelectedCountry,
} from "@/lib/localization/country";
import { detectVisitorCountry } from "@/lib/localization/geo";
import { getLocalization } from "@/lib/shopify/localization-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/localization — the real list of countries/currencies Shopify has
 * configured for this store, the shop's default market for this visitor's
 * detected country, and whichever country they already chose. Powers the
 * currency selector — nothing here is hardcoded.
 */
export async function GET(request: NextRequest) {
  const detected = detectVisitorCountry(request.headers);
  // No selector in the nav any more: GeoIP alone decides, and a country
  // cookie left over from when there was one is cleared rather than honoured.
  if (!COUNTRY_SELECTOR_ENABLED && request.cookies.has("_hv_country")) {
    await clearSelectedCountry();
  }
  try {
    const [localization, selected] = await Promise.all([
      getLocalization(detected),
      readSelectedCountry(),
    ]);
    return NextResponse.json(
      {
        defaultCountry: localization.defaultCountry,
        countries: localization.availableCountries,
        selected,
        // What the host's GeoIP header said for this request (null when it
        // sent none) — so a wrong currency in production can be diagnosed by
        // opening /api/localization in the browser.
        detected,
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    // Shopify's country list could not be read. The visitor's GeoIP country
    // is still known, so hand it back (name only — no currency data) and let
    // the live price call do the localizing; answering "no country" here
    // would leave the page in the base currency while checkout, which knows
    // the country from the same header, priced in the visitor's own.
    let name: string = detected ?? "";
    try {
      if (detected) name = new Intl.DisplayNames(["en"], { type: "region" }).of(detected) ?? detected;
    } catch {
      /* keep the code */
    }
    return NextResponse.json(
      {
        defaultCountry: detected
          ? { isoCode: detected, name, currency: { isoCode: "", symbol: "" } }
          : null,
        countries: [],
        selected: null,
        detected,
      },
      { status: 200, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
