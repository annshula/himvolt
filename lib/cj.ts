/**
 * CJDropshipping tracking adapter — wired but dormant, same shape as
 * lib/shopify.ts. Set the two env vars below and `getTracking()` starts
 * calling the real API; until then it returns an honest "not connected yet"
 * result instead of throwing or faking data.
 *
 *   CJ_API_EMAIL=you@himvolt.com
 *   CJ_API_KEY=...
 *
 * ⚠️ Endpoint shapes below follow CJDropshipping's published API v2
 * (developers.cjdropshipping.com) as of this writing — verify against their
 * current docs before relying on this in production; dropshipping platform
 * APIs change their contracts without much notice.
 */

const EMAIL = process.env.CJ_API_EMAIL;
const KEY = process.env.CJ_API_KEY;
const API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export const cjEnabled = Boolean(EMAIL && KEY);

export type TrackingStepState = "done" | "current" | "pending";

export type TrackingStep = {
  label: string;
  description?: string;
  location?: string;
  at?: string;
  state: TrackingStepState;
};

export type TrackingResult =
  | {
      ok: true;
      trackingNumber: string;
      carrier?: string;
      steps: TrackingStep[];
    }
  | { ok: false; reason: string };

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  if (!EMAIL || !KEY) return null;

  try {
    const res = await fetch(`${API_BASE}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: KEY }),
      // Tokens are short-lived on CJ's side; never let Next cache this call.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: { accessToken?: string; accessTokenExpiryDate?: string };
      result?: boolean;
    };
    const token = data.data?.accessToken;
    if (!token) return null;

    cachedToken = {
      token,
      // Refresh 5 minutes early rather than riding the token to the wire.
      expiresAt: data.data?.accessTokenExpiryDate
        ? new Date(data.data.accessTokenExpiryDate).getTime() - 5 * 60_000
        : Date.now() + 55 * 60_000,
    };
    return token;
  } catch (err) {
    console.error("CJ auth failed", err);
    return null;
  }
}

const NOT_CONNECTED =
  "Order tracking isn't connected yet. Email us the order number and we'll check it by hand.";

/** Looks up a tracking or order number. Always resolves — never throws. */
export async function getTracking(trackingNumber: string): Promise<TrackingResult> {
  const clean = trackingNumber.trim();
  if (!clean) return { ok: false, reason: "Enter an order or tracking number." };

  if (!cjEnabled) {
    return { ok: false, reason: NOT_CONNECTED };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: NOT_CONNECTED };
  }

  try {
    const res = await fetch(
      `${API_BASE}/logistic/trackInfo?trackNumber=${encodeURIComponent(clean)}`,
      {
        headers: { "CJ-Access-Token": token },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        reason: "We couldn't find that number. Double-check it and try again.",
      };
    }

    const data = (await res.json()) as {
      data?: {
        logisticCompanyEn?: string;
        days?: { location?: string; description?: string; time?: string }[];
      };
    };

    const days = data.data?.days ?? [];
    if (days.length === 0) {
      return {
        ok: false,
        reason: "No tracking events yet — check back once it ships.",
      };
    }

    // CJ returns newest-first; the timeline reads oldest-to-newest.
    const ordered = [...days].reverse();
    const steps: TrackingStep[] = ordered.map((d, i) => ({
      label: d.description ?? "Update",
      location: d.location,
      at: d.time,
      state: i === ordered.length - 1 ? "current" : "done",
    }));

    return {
      ok: true,
      trackingNumber: clean,
      carrier: data.data?.logisticCompanyEn,
      steps,
    };
  } catch (err) {
    console.error("CJ tracking lookup failed", err);
    return {
      ok: false,
      reason: "We couldn't reach tracking right now. Please try again shortly.",
    };
  }
}
