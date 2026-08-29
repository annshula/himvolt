import { NextResponse, type NextRequest } from "next/server";

/**
 * Security middleware (Next 15 `middleware.ts`).
 *
 * Two jobs, both cheap enough for every request:
 *  1. Attach a Content-Security-Policy header.
 *  2. Send unauthenticated visitors away from /account/* before a page renders
 *     (presence-only check; the real authorization still happens server-side
 *     in `requireCustomer()`, so a forged cookie fails there, not here).
 *
 * On the CSP: `'unsafe-inline'` in script-src is a deliberate trade-off, not
 * an oversight. Next.js ships its RSC hydration payload as inline <script>
 * tags whose content is per-request, so it cannot be nonced or hashed without
 * forfeiting static generation. This app renders no raw user-submitted HTML
 * anywhere, so the XSS surface `'unsafe-inline'` leaves open is minimal, and
 * every other directive stays strict.
 *
 * `'unsafe-eval'` is dev-only (React's dev build calls eval() for Fast Refresh;
 * production builds never do). `upgrade-insecure-requests` is prod-only too —
 * on a plain http://localhost dev origin it would upgrade every same-origin
 * asset to https://localhost and break the dev server.
 */
const SESSION_COOKIE = "_hv_session";

/** Public /account routes: the auth flow itself must stay reachable. */
const PUBLIC_ACCOUNT_PATHS = new Set([
  "/account/login",
  "/account/authorize",
  "/account/callback",
  "/account/logout",
]);

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Microsoft Clarity origins, allowed only when a project id is configured —
 * the tag script lives on clarity.ms, and replay/heatmap payloads upload to
 * regional *.clarity.ms hosts. With no id the app never loads Clarity, so the
 * CSP stays as tight as it was.
 */
const CLARITY_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
const CLARITY_SRC = CLARITY_ENABLED
  ? " https://www.clarity.ms https://*.clarity.ms"
  : "";

/**
 * Microsoft Clarity also fires a sync/telemetry beacon as an <img> from
 * c.bing.com (Clarity rides on Microsoft's Bing infrastructure). It's a
 * plain image load, so it needs `img-src` but not `script-src` or
 * `connect-src`. Gated the same way as the rest of Clarity.
 */
const CLARITY_IMG_SRC = CLARITY_ENABLED ? " https://c.bing.com" : "";

const CSP = [
  `default-src 'self'`,
  // See module doc for why 'unsafe-inline' is here (Next's inline RSC payload).
  // googletagmanager.com hosts the gtag.js/GTM loaders and GTM-injected tags.
  // clarity.ms hosts the Clarity tag script.
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com${CLARITY_SRC}${IS_DEV ? ` 'unsafe-eval'` : ""}`,
  // Components set dynamic inline styles, so styles need 'unsafe-inline' —
  // styles cannot execute script, so this is low risk.
  `style-src 'self' 'unsafe-inline'`,
  // Product imagery + video come from Shopify's CDN once the store is live.
  // GA4 also paints a 1px beacon from google-analytics.com; Clarity beacons
  // from c.bing.com.
  `img-src 'self' data: blob: https://cdn.shopify.com https://*.myshopify.com https://www.google-analytics.com https://*.google-analytics.com${CLARITY_SRC}${CLARITY_IMG_SRC}`,
  `media-src 'self' https://cdn.shopify.com https://*.myshopify.com`,
  `font-src 'self' data:`,
  // gtag.js sends hits to the GA4 endpoints over fetch/XHR; Clarity uploads
  // replay/heatmap payloads to regional clarity.ms hosts.
  `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com${CLARITY_SRC}${IS_DEV ? " ws://localhost:* wss://localhost:*" : ""}`,
  // GTM's noscript fallback embeds an iframe from googletagmanager.com.
  `frame-src 'self' https://www.googletagmanager.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
  ...(IS_DEV ? [] : [`upgrade-insecure-requests`]),
].join("; ");

export default function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  const respond = (response: NextResponse): NextResponse => {
    response.headers.set("Content-Security-Policy", CSP);
    return response;
  };

  // ── Account guard (presence-only; authorize server-side later) ───────
  if (pathname.startsWith("/account") && !PUBLIC_ACCOUNT_PATHS.has(pathname)) {
    if (!request.cookies.has(SESSION_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/login";
      url.search = `?returnTo=${encodeURIComponent(pathname + search)}`;
      return respond(NextResponse.redirect(url));
    }
  }

  return respond(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static files. (API routes pass
     * through — only the CSP header is attached, which is harmless there.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|txt|json)$).*)",
  ],
};
