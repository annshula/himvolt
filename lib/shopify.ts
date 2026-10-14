/**
 * Shopify Storefront API adapter. `createCheckout()` is the one live call
 * left here — cart creation is inherently real-time. `getProduct()` is no
 * longer live: it reads the synced catalog (data/product.json), refreshed
 * only by `npm run shopify:sync-product` or POST /api/admin/sync-product
 * (lib/shopify/sync-product.ts), so the product page never depends on
 * Shopify responding at request time.
 */

import {
  getProductByHandle,
  product as mainProduct,
  type Product,
} from "./product";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-07";

export const shopifyEnabled = Boolean(DOMAIN && TOKEN);

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 300,
): Promise<T | null> {
  if (!shopifyEnabled) return null;

  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate, tags: ["shopify"] },
  });

  if (!res.ok) {
    console.error(`Shopify ${res.status}: ${await res.text()}`);
    return null;
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    console.error("Shopify GraphQL errors", json.errors);
    return null;
  }
  return json.data ?? null;
}

/**
 * The product model from data/product.json — lib/product.ts already reads
 * the whole catalog from that one file. Prices on it are the shop's base
 * currency; the shopper's own currency is Shopify's live answer for their
 * country, applied on top in the browser (useLocalizedAmount), so no
 * exchange rate or per-market snapshot lives here.
 *
 * Kept `async` for call-site compatibility even though nothing here awaits —
 * every caller already does `await getProduct()`.
 */
export async function getProduct(handle?: string): Promise<Product> {
  return (handle && getProductByHandle(handle)) || mainProduct;
}

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        message
      }
    }
  }
`;

/**
 * Creates a Shopify cart and returns the hosted checkout URL. `countryCode`
 * is the same country the page's prices were fetched for, so Shopify prices
 * the cart in the same market and currency the shopper was shown.
 */
export async function createCheckout(
  variantId: string,
  quantity = 1,
  countryCode: string | null = null,
): Promise<string | null> {
  // Defense-in-depth: every caller's quantity is coerced to a finite integer
  // and clamped to the store's 1-20 range before reaching Shopify, so no route
  // can create carts with unbounded/nonsensical quantities.
  const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, 20));
  const data = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    CART_CREATE,
    {
      input: {
        lines: [{ merchandiseId: variantId, quantity: safeQuantity }],
        ...(countryCode && /^[A-Z]{2}$/.test(countryCode)
          ? { buyerIdentity: { countryCode } }
          : {}),
      },
    },
    0,
  );

  return data?.cartCreate.cart?.checkoutUrl ?? null;
}
