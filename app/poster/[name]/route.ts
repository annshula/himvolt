import { NextRequest, NextResponse } from "next/server";

/**
 * Serves a <video poster> with real AVIF/WebP content negotiation.
 *
 * The HTML `poster` attribute is a single URL with no `<source type>`
 * equivalent, so a browser can never be offered "AVIF, else WebP" the way
 * <picture> or next/image handle it. This route recreates that behaviour by
 * reading the request's own Accept header — exactly what the browser sends
 * when deciding what an <img>/<picture> can render — and returning whichever
 * file matches, so posters get the same format negotiation ordinary content
 * images get for free from next/image.
 *
 * Deliberately fetches the file via its own public URL rather than reading
 * it off disk with `fs`. A serverless deploy (Vercel) only bundles files a
 * Route Handler's static file-trace can prove it needs, and a path built
 * from a runtime `POSTERS[name]` lookup defeats that trace — it works under
 * `next dev`/`next start` on a real filesystem and then 500s once deployed.
 * Fetching the asset's real /public URL instead goes through the same
 * static-asset serving path every other image on the site uses, so it works
 * the same way everywhere.
 */
const POSTERS: Record<string, { avif: string; webp: string }> = {
  hero: {
    avif: "/videos/himvolt-hero-poster.avif",
    webp: "/videos/himvolt-hero-poster.webp",
  },
  stone: {
    avif: "/media/current-poster.avif",
    webp: "/media/current-poster.webp",
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const poster = POSTERS[name];
  if (!poster) return new NextResponse("Not found", { status: 404 });

  const accept = request.headers.get("accept") ?? "";
  const wantsAvif = accept.includes("image/avif");
  const assetPath = wantsAvif ? poster.avif : poster.webp;
  const contentType = wantsAvif ? "image/avif" : "image/webp";

  const upstream = await fetch(new URL(assetPath, request.url));
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Two different bytes can come back for the same URL depending on
      // this header — tell every cache in front of this route to key on it.
      Vary: "Accept",
    },
  });
}
