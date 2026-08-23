import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { syncProduct } from "@/lib/shopify/sync-product";

/**
 * POST /api/admin/sync-product
 *
 * The one place besides `npm run shopify:sync-product` that talks to Shopify
 * live — pulls the product, its variants, and every curated market's price
 * list, then overwrites data/product.json. Every page reads that file only.
 * Protected by ADMIN_API_KEY (Bearer token).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) return unauthorizedResponse();

  const handle = new URL(request.url).searchParams.get("handle") ?? undefined;

  try {
    const record = await syncProduct(handle);
    return NextResponse.json(
      {
        ok: true,
        syncedAt: record.syncedAt,
        shop: record.shop,
        markets: record.markets,
        product: record.product,
      },
      { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } },
    );
  } catch (error) {
    console.error("[admin/sync-product] failed:", (error as Error).message);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function GET(): Promise<Response> {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
