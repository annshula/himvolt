/**
 * Shopify Storefront API adapter. `createCheckout()` is the one live call
 * left here — cart creation is inherently real-time. `getProduct()` is no
 * longer live: it reads the synced catalog (data/product.json), refreshed
 * only by `npm run shopify:sync-product` or POST /api/admin/sync-product
 * (lib/shopify/sync-product.ts), so the product page never depends on
 * Shopify responding at request time.
 */

import { priceForMarket } from "./catalog";
import { getProductByHandle, product as mainProduct, type Product, type Variant } from "./product";

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
 * Builds a product model from data/product.json — lib/product.ts already
 * reads the whole catalog from that one file, so the only thing left to
 * resolve here is per-market price, which is legitimately request-time
 * work: no country is known yet at this layer (that's the currency
 * selector's job, applied on top via useLocalizedAmount), so
 * priceForMarket(id, null) resolves to the US market's real price, not the
 * raw Admin default (a different, lower number — see lib/catalog.ts's
 * priceForMarket).
 *
 * Kept `async` for call-site compatibility even though nothing here awaits —
 * every caller already does `await getProduct()`.
 */
export async function getProduct(handle?: string): Promise<Product> {
  const base = (handle && getProductByHandle(handle)) || mainProduct;

  const variants: Variant[] = base.variants.map((v) => {
    const defaultPrice = priceForMarket(v.id, null);
    return {
      ...v,
      price: { amount: defaultPrice.amount, currencyCode: defaultPrice.currencyCode },
      compareAtPrice:
        defaultPrice.compareAtAmount != null
          ? { amount: defaultPrice.compareAtAmount, currencyCode: defaultPrice.currencyCode }
          : undefined,
    };
  });

  return { ...base, variants };
}

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
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

/** Creates a Shopify cart and returns the hosted checkout URL. */
export async function createCheckout(
  variantId: string,
  quantity = 1,
): Promise<string | null> {
  const data = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(CART_CREATE, { lines: [{ merchandiseId: variantId, quantity }] }, 0);

  return data?.cartCreate.cart?.checkoutUrl ?? null;
}
