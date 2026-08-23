import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { syncAllProducts } from "@/lib/shopify/sync-product";

/**
 * POST /api/admin/sync-product
 *
 * The one place besides `npm run shopify:sync` that talks to Shopify live —
 * refreshes every product already in data/product.json (id, handle, title,
 * images, variants, every curated market's price list), then overwrites the
 * file. Every page reads that file only. Protected by ADMIN_API_KEY (Bearer
 * token).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) return unauthorizedResponse();

  try {
    const record = await syncAllProducts();
    return NextResponse.json(
      {
        ok: true,
        syncedAt: record.syncedAt,
        shop: record.shop,
        markets: record.markets,
        products: record.products.map((p) => ({
          handle: p.handle,
          title: p.title,
          price: p.price,
          availableForSale: p.availableForSale,
          variantCount: p.variants.length,
        })),
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
