"use client";

import NextImage, { type ImageLoaderProps, type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for next/image that:
 *
 * 1. Routes Shopify-hosted images (cdn.shopify.com / *.myshopify.com)
 *    through a custom `loader` that asks Shopify's own CDN to resize via
 *    its native `?width=` transform param, instead of Vercel's Image
 *    Optimization pipeline. Supplying a `loader` makes next/image build its
 *    `srcset` from those URLs directly — it never calls `/_next/image` for
 *    these sources at all, so this costs nothing against the account's
 *    Image Optimization quota (see the `payment_required` incident it
 *    caused) while still shipping real per-breakpoint responsive images
 *    (not one full-size original to every device, which plain
 *    `unoptimized` would do — that trades the Vercel bill for worse mobile
 *    LCP/bandwidth, which this avoids). The store's product/variant/
 *    metaobject images are the overwhelming majority of distinct source
 *    URLs in this app, so this is what actually keeps the quota from
 *    maxing out. Only applies when the caller hasn't already set its own
 *    `loader`; every other source still optimizes through Vercel as before.
 *
 * 2. Shows the shared `.skeleton` shimmer (app/globals.css) as the image's
 *    own CSS background while it loads. A background on a replaced element
 *    like `<img>` paints behind the decoded pixels, so once the photo loads
 *    it naturally covers the shimmer — no onLoad/useState needed. Only
 *    right for images that end up fully opaque over their whole box,
 *    though — a background doesn't get covered by transparent pixels, so
 *    anything with real transparency (a logo mark, an icon) needs
 *    `skeleton={false}` or the shimmer shows through around/behind the art
 *    forever, not just while it loads.
 *
 * "use client": required for (1) — `loader` is a plain function, and
 * next/image only gets special compiler treatment for passing a function
 * prop like that across the server/client boundary when it's imported and
 * used directly, not through an intermediary wrapper like this one. Once
 * this component renders NextImage itself, both need to live in the same
 * client tree. This costs nothing extra beyond what next/image already
 * needed client-side (lazy loading, the IntersectionObserver, etc.) — it
 * was always a client component under the hood, this just makes that
 * explicit instead of relying on the special-cased passthrough.
 */
function isShopifyHosted(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false;
  let hostname: string;
  try {
    hostname = new URL(src, "https://placeholder.invalid").hostname;
  } catch {
    return false;
  }
  return hostname === "cdn.shopify.com" || hostname.endsWith(".myshopify.com");
}

/** Shopify's CDN resizes on the fly for any file URL — set `width`, drop any prior one (e.g. a stale value from a previous render size) so each breakpoint gets its own real transform instead of re-serving one cached size. */
function shopifyLoader({ src, width }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.toString();
}

export default function Image({
  src,
  loader,
  className,
  skeleton = true,
  ...rest
}: ImageProps & {
  /** Set false for anything with real transparency (logo, icon) — see note above. Default true. */
  skeleton?: boolean;
}) {
  return (
    <NextImage
      src={src}
      loader={loader ?? (isShopifyHosted(src) ? shopifyLoader : undefined)}
      className={skeleton ? cn("skeleton", className) : className}
      {...rest}
    />
  );
}
