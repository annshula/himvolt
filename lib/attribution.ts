/**
 * Ad-click attribution that survives the hop to Shopify's hosted checkout.
 *
 * The shopper lands here from an ad with utm_* / placement / fbclid / any other
 * query params in the URL, then pays on Shopify's own domain — which never sees
 * them. So every landing query param is captured (AttributionCapture), kept in
 * localStorage, and sent with the cart request, where the server writes them
 * onto the Shopify cart as attributes. Shopify copies cart attributes onto the
 * order (note_attributes), so they show in the admin and reach the orders/paid
 * webhook, which uses fbc/fbp to match the Purchase back to the ad click.
 */

export type Attribution = Record<string, string>;

/**
 * A landing counts as an ad landing only when it carries one of these. Plain
 * internal URLs (`?variant=…`, `?q=…`) never overwrite the stored campaign.
 * Last-touch: a new ad landing replaces the stored set.
 */
const TRIGGER_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "placement",
  "fbclid",
  "gclid",
  "ttclid",
];

const STORAGE_KEY = "hv_attribution";
export const MAX_ENTRIES = 40;
export const MAX_KEY_LENGTH = 64;
export const MAX_VALUE_LENGTH = 255;
const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.\-]*$/;

/**
 * Shared by browser and server (the cart route imports this file, so it must
 * NOT become a "use client" module): keeps only safe, bounded string pairs.
 */
export function sanitizeAttribution(input: unknown): Attribution {
  const out: Attribution = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_ENTRIES) break;
    if (key.length > MAX_KEY_LENGTH || !KEY_PATTERN.test(key)) continue;
    if (typeof value !== "string") continue;
    const v = value.trim();
    // An unsubstituted Meta macro (`{{ad.id}}`) means the ad's URL tags were
    // misconfigured — not worth storing as if it were data.
    if (!v || v.length > MAX_VALUE_LENGTH || v.includes("{{")) continue;
    out[key] = v;
  }
  return out;
}

function read(): Attribution {
  try {
    return sanitizeAttribution(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}"),
    );
  } catch {
    return {};
  }
}

function cookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Stores every query param on this landing URL. A visit with no params (e.g. a
 * direct return to the site) leaves the earlier capture in place, so the
 * campaign that brought the shopper is still known when they check out later.
 */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!TRIGGER_KEYS.some((k) => params.has(k))) return;
    // Leave room for landing_page + fbp/fbc/external_id added at checkout.
    const fresh = Object.fromEntries(
      Object.entries(sanitizeAttribution(Object.fromEntries(params))).slice(
        0,
        MAX_ENTRIES - 5,
      ),
    );
    if (Object.keys(fresh).length === 0) return;

    fresh.landing_page = window.location.pathname.slice(0, MAX_VALUE_LENGTH);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    /* storage blocked — attribution is best-effort */
  }
}

const EXTERNAL_ID_KEY = "himvolt.external_id.v1";

/**
 * Random per-browser id, persisted once. Sent to Meta as `external_id` on the
 * server-side Purchase so the same browser's ViewContent → AddToCart → Purchase
 * link into one match. A random UUID carries no PII, so it needs no hashing.
 */
function getExternalId(): string | undefined {
  try {
    const existing = window.localStorage.getItem(EXTERNAL_ID_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(EXTERNAL_ID_KEY, fresh);
    return fresh;
  } catch {
    return undefined;
  }
}

/** The captured params plus the live Meta cookies, ready to send with checkout. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const stored = read();
  const result: Attribution = { ...stored };

  const fbp = cookie("_fbp");
  if (fbp) result.fbp = fbp.slice(0, MAX_VALUE_LENGTH);

  // The pixel writes _fbc itself when fbclid is in the URL; if the pixel was
  // blocked or slow, rebuild it in Meta's documented format from the click id.
  const fbc =
    cookie("_fbc") ??
    (stored.fbclid ? `fb.1.${Date.now()}.${stored.fbclid}` : undefined);
  if (fbc) result.fbc = fbc.slice(0, MAX_VALUE_LENGTH);

  const externalId = getExternalId();
  if (externalId) result.external_id = externalId;

  return result;
}
