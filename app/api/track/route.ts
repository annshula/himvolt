import { NextResponse } from "next/server";
import { getTracking } from "@/lib/cj";

/**
 * Looks up a shipment via CJDropshipping. Always returns 200 with an
 * `{ ok }` discriminator — a failed or not-yet-connected lookup is not a
 * server error, it is a normal, expected result the UI needs to render.
 */
export async function POST(request: Request) {
  let body: { trackingNumber?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "Malformed request." },
      { status: 400 },
    );
  }

  if (!body.trackingNumber) {
    return NextResponse.json(
      { ok: false, reason: "Enter an order or tracking number." },
      { status: 400 },
    );
  }

  const result = await getTracking(body.trackingNumber);
  return NextResponse.json(result);
}
