import { NextRequest, NextResponse } from "next/server";

import { graphqlRequest, ShopifyGraphQLError } from "@/lib/shopify/client";
import { getAdminToken } from "@/lib/shopify/admin-token";
import { adminEndpoint, isAdminConfigured } from "@/lib/shopify/config";

export const dynamic = "force-dynamic";

/**
 * The one welcome discount code every subscriber gets, created once in
 * Shopify Admin (title "Newsletter welcome — 10% off", all products, all
 * customers). A single reusable code, not a unique one issued per signup —
 * the app's Admin token has write_customers but no discount-write scope, and
 * a shared code is a normal, honest pattern (not fabricated urgency).
 */
const WELCOME_CODE = "WELCOME10";

const CUSTOMER_CREATE = /* GraphQL */ `
  mutation NewsletterSignup($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CustomerCreateResponse = {
  customerCreate: {
    customer: { id: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;

// In-memory sliding-window rate limiter for signup abuse. Bounds the number
// of Shopify customerCreate calls per client IP and per email address. For
// multi-instance deployments, replace with a shared store (e.g. Upstash
// Redis or Vercel KV) keyed identically.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_SIGNUPS_PER_IP = 5;
const MAX_SIGNUPS_PER_EMAIL = 3;
const signupAttempts = new Map<string, number[]>();

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const recent = (signupAttempts.get(key) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (recent.length >= max) {
    signupAttempts.set(key, recent);
    return true;
  }
  recent.push(now);
  signupAttempts.set(key, recent);
  return false;
}

/**
 * POST /api/newsletter — captures an email as a real Shopify customer with
 * email marketing consent (visible in Shopify Admin > Customers today; wire
 * Klaviyo/Mailchimp to that list later without touching this route). Returns
 * the shared welcome code on success. "Already subscribed" is treated as
 * success too — Shopify rejects a duplicate email, but from the shopper's
 * side re-submitting their own email should never look like an error.
 */
export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Newsletter signup isn't configured yet." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX_LENGTH) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  // Unauthenticated, state-changing endpoint — throttle per client IP and per
  // email address so an attacker can't fabricate unbounded Shopify customers.
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`ip:${clientIp}`, MAX_SIGNUPS_PER_IP)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many signup attempts. Please try again later.",
      },
      { status: 429 },
    );
  }
  if (isRateLimited(`email:${email.toLowerCase()}`, MAX_SIGNUPS_PER_EMAIL)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many signup attempts. Please try again later.",
      },
      { status: 429 },
    );
  }

  try {
    const token = await getAdminToken();
    const data = await graphqlRequest<CustomerCreateResponse>({
      endpoint: adminEndpoint(),
      query: CUSTOMER_CREATE,
      variables: {
        input: {
          email,
          // Double opt-in: consent starts PENDING (not a fabricated SUBSCRIBED
          // record) and Shopify emails the address a confirmation link; only a
          // real owner clicking it flips the state to SUBSCRIBED.
          emailMarketingConsent: {
            marketingState: "PENDING",
            marketingOptInLevel: "CONFIRMED_OPT_IN",
          },
          tags: ["newsletter"],
        },
      },
      bearerToken: undefined,
      headers: { "X-Shopify-Access-Token": token },
      retries: 1,
    });

    const alreadyExists = data.customerCreate.userErrors.some(
      (e) => e.field?.includes("email") && /taken|already/i.test(e.message),
    );
    if (!data.customerCreate.customer && !alreadyExists) {
      const message =
        data.customerCreate.userErrors[0]?.message ?? "Couldn't sign you up.";
      return NextResponse.json({ ok: false, error: message }, { status: 422 });
    }

    return NextResponse.json({ ok: true, code: WELCOME_CODE });
  } catch (error) {
    console.error("[newsletter] signup failed:", error);
    const message =
      error instanceof ShopifyGraphQLError
        ? error.message
        : "Something went wrong — try again in a moment.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
