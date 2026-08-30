import { readFile } from "node:fs/promises";
import path from "node:path";
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
 */
const POSTERS: Record<string, { avif: string; webp: string }> = {
  hero: {
    avif: "public/videos/himvolt-hero-poster.avif",
    webp: "public/videos/himvolt-hero-poster.webp",
  },
  stone: {
    avif: "public/media/current-poster.avif",
    webp: "public/media/current-poster.webp",
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
  const relativePath = wantsAvif ? poster.avif : poster.webp;
  const contentType = wantsAvif ? "image/avif" : "image/webp";

  const file = await readFile(path.join(process.cwd(), relativePath));
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Two different bytes can come back for the same URL depending on
      // this header — tell every cache in front of this route to key on it.
      Vary: "Accept",
    },
  });
}
