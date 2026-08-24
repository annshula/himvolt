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
      customer { id }
      userErrors { field message }
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
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address." },
      { status: 400 },
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
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            marketingOptInLevel: "SINGLE_OPT_IN",
          },
          tags: ["newsletter"],
        },
      },
      bearerToken: undefined,
      headers: { "X-Shopify-Access-Token": token },
      retries: 1,
    });

    const alreadyExists = data.customerCreate.userErrors.some(
      (e) =>
        e.field?.includes("email") && /taken|already/i.test(e.message),
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
