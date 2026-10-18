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

const STORAGE_KEY = "hv_attribution";
export const MAX_ENTRIES = 40;
export const MAX_KEY_LENGTH = 64;
export const MAX_VALUE_LENGTH = 255;

function read(): Attribution {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Attribution;
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
    const fresh: Attribution = {};
    for (const [key, raw] of new URLSearchParams(window.location.search)) {
      const value = raw.trim();
      if (!key || !value || key.length > MAX_KEY_LENGTH) continue;
      if (Object.keys(fresh).length >= MAX_ENTRIES - 3) break;
      fresh[key] = value.slice(0, MAX_VALUE_LENGTH);
    }
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
