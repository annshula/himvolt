import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Bearer-token guard for internal admin routes (ported from the Trackify
 * reference's lib/admin/auth.ts). These endpoints can trigger a Shopify sync,
 * so they must never be reachable by a customer. With no ADMIN_API_KEY
 * configured they fail closed rather than opening up.
 */
export function isAuthorizedAdminRequest(request: Request): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : "";
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": "Bearer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
