import { NextRequest, NextResponse } from "next/server";

import { readSelectedCountry } from "@/lib/localization/country";
import { detectVisitorCountry } from "@/lib/localization/geo";
import { getFreightEstimate, type FreightResult } from "@/lib/cj";
import { cjVidForSku } from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PINCODE_RE = /^[A-Za-z0-9\s-]{3,12}$/;

/**
 * POST /api/shipping-estimate
 *   body: { pincode: string, sku?: string }
 *
 * Live delivery-date estimate for the shopper's pincode, via CJDropshipping's
 * freight API (lib/cj.ts) — a real per-address lookup, not the country-level
 * ranges in data/cj-shipping.json. Destination country comes from the same
 * cookie/geo-detection the currency selector already uses (lib/localization/
 * country.ts), so the shopper only has to type a pincode, not pick a country
 * twice.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<FreightResult>(
      { ok: false, reason: "Invalid request." },
      { status: 400 },
    );
  }

  const pincode = (body as { pincode?: unknown })?.pincode;
  if (typeof pincode !== "string" || !PINCODE_RE.test(pincode.trim())) {
    return NextResponse.json<FreightResult>({
      ok: false,
      reason: "Enter a valid delivery pincode.",
    });
  }

  const sku = (body as { sku?: unknown })?.sku;
  const variantId = cjVidForSku(typeof sku === "string" ? sku : "");

  const country =
    (await readSelectedCountry()) ?? detectVisitorCountry(request.headers) ?? "US";

  const result = await getFreightEstimate({
    variantId,
    endCountryCode: country,
    zip: pincode.trim(),
  });

  return NextResponse.json<FreightResult>(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
