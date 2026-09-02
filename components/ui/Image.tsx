import NextImage, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for next/image that:
 *
 * 1. Skips Vercel's Image Optimization pipeline for Shopify-hosted images
 *    (cdn.shopify.com / *.myshopify.com). Shopify's CDN already resizes and
 *    compresses on the fly via its own `?width=` URL params, so
 *    re-optimizing through Vercel is redundant work that only costs against
 *    the account's Image Optimization quota — the store's product/variant/
 *    metaobject images are the overwhelming majority of distinct source
 *    URLs in this app, so this is what actually keeps that quota from
 *    maxing out (see the `payment_required` incident it caused). Only
 *    changes behavior for Shopify hosts, and only when the caller hasn't
 *    already set `unoptimized` itself — every other source still optimizes
 *    through Vercel exactly as before.
 *
 * 2. Shows the shared `.skeleton` shimmer (app/globals.css) as the image's
 *    own CSS background while it loads. A background on a replaced element
 *    like `<img>` paints behind the decoded pixels, so once the photo loads
 *    it naturally covers the shimmer — no onLoad/useState/extra wrapper
 *    needed, so this still renders from server components exactly like
 *    next/image does (no "use client" here).
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

export default function Image({
  src,
  unoptimized,
  className,
  ...rest
}: ImageProps) {
  return (
    <NextImage
      src={src}
      unoptimized={unoptimized ?? isShopifyHosted(src)}
      className={cn("skeleton", className)}
      {...rest}
    />
  );
}
