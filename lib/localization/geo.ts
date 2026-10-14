/**
 * Visitor country from whichever edge/CDN in front of the app already
 * geolocated the request — never computed by this app. Returns null on
 * localhost (no such header) so pricing falls back to the shop default.
 *
 * Headers checked, in order: `CF-IPCountry` (Cloudflare) and
 * `x-vercel-ip-country` (Vercel). Outside production only, DEV_GEO_COUNTRY
 * (e.g. `DEV_GEO_COUNTRY=GB` in .env) stands in for the header so the
 * country → currency path can be tried on localhost; it is ignored in
 * production builds.
 */

type HeaderSource = { get(name: string): string | null };

/** An ISO 3166 alpha-2 code, minus the placeholders CDNs send for "unknown". */
function validCountry(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return null;
  return code;
}

/**
 * First *valid* header wins. A CDN in front of the app can send a
 * placeholder ("XX" for unknown, "T1" for Tor) while the next header in line
 * holds a real country — taking the first non-empty value and then
 * rejecting it would throw the good one away.
 */
export function detectVisitorCountry(headers: HeaderSource): string | null {
  return (
    validCountry(headers.get("cf-ipcountry")) ??
    validCountry(headers.get("x-vercel-ip-country")) ??
    (process.env.NODE_ENV !== "production"
      ? validCountry(process.env.DEV_GEO_COUNTRY)
      : null)
  );
}
