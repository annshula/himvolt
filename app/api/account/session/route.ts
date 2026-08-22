import { NextResponse } from "next/server";

import { isSignedIn } from "@/lib/shopify/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lightweight sign-in probe for client components (the header account menu
 * and the mobile drawer). Returns the boolean only — never the session or any
 * customer data.
 */
export async function GET() {
  const signedIn = await isSignedIn();
  return NextResponse.json(
    { signedIn },
    { headers: { "Cache-Control": "no-store" } },
  );
}
