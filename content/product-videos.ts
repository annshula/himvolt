import type { ShowcaseVideo } from "@/components/product/ProductVideoShowcase";

/**
 * Local clips for each product page's "See it in action" video rail — served
 * from `public/videos/<folder>/`, not Shopify media, so they're independent
 * of the catalog sync.
 *
 * To add clips for a product:
 *   1. Drop the `.mp4` files in `public/videos/<folder>/` (portrait, 720p,
 *      ~1 Mbps keeps the page light).
 *   2. Make a still frame beside each one, same name with `.webp`:
 *        ffmpeg -ss 0.5 -i clip.mp4 -frames:v 1 -vf scale=400:-2 -c:v libwebp -quality 70 clip.webp
 *   3. List them under the product's handle below.
 *
 * A product with no entry (or an empty list) shows no video section at all.
 */
const clip = (
  src: string,
  alt: string,
  extra?: Partial<ShowcaseVideo>,
): ShowcaseVideo => ({
  src,
  poster: src.replace(/\.mp4$/, ".webp"),
  alt,
  ...extra,
});

export const productVideosByHandle: Record<string, ShowcaseVideo[]> = {
  // HimVolt arm trainer — public/videos/arm-trainer (540×960, no audio, a
  // still frame beside each clip).
  "hydraulic-arm-trainer": [1, 2, 3, 4, 5, 6].map((n) =>
    clip(
      `/videos/arm-trainer/arm-trainer-${n}.mp4`,
      `HimVolt arm trainer video ${n}`,
    ),
  ),
};

/** Kept exported so a new product's entry can be written with the same helper. */
export { clip };

export function videosForHandle(handle: string): ShowcaseVideo[] {
  return productVideosByHandle[handle] ?? [];
}
