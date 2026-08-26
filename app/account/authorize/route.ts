import { NextRequest, NextResponse } from "next/server";

import {
  beginOAuth,
  safeReturnTo,
  writeOAuthTransaction,
} from "@/lib/shopify/customer-account";
import { isCustomerAccountConfigured } from "@/lib/shopify/config";
import { isSignedIn } from "@/lib/shopify/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Starts the Shopify Customer Account OAuth 2.0 + PKCE flow. A plain redirect
 * (not a mutation) — the browser is pointed at Shopify's hosted sign-in.
 */
export async function GET(request: NextRequest) {
  // Validate before either branch redirects: the signed-in branch used to pass
  // the raw returnTo into new URL(), which resolves absolute / protocol-relative
  // / backslash inputs to off-host URLs (open redirect). safeReturnTo restricts
  // it to a same-origin relative path.
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));

  if (await isSignedIn()) {
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  if (!isCustomerAccountConfigured()) {
    return NextResponse.redirect(
      new URL("/account/login?error=unconfigured", request.url),
    );
  }

  const { tx, authorizeUrl } = beginOAuth(returnTo);
  await writeOAuthTransaction(tx);
  const url = await authorizeUrl;
  return NextResponse.redirect(url);
}
