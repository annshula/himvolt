import { site } from "@/lib/site";

/** Turns a site-relative path into an absolute URL for metadata/JSON-LD. */
export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
