/**
 * Shopify Storefront API adapter — wired but dormant.
 *
 * Today every component reads `lib/product.ts`. When the store is live, set
 * the two env vars below and `getProduct()` starts returning live data with an
 * identical shape; nothing in the UI has to change.
 *
 *   SHOPIFY_STORE_DOMAIN=himvolt.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN=shpat_xxx
 */

import { product as fallback, type Product, type Variant } from "./product";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = "2025-07";

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

const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      images(first: 8) {
        nodes { url altText width height }
      }
      variants(first: 12) {
        nodes {
          id
          sku
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { url }
          weight
        }
      }
    }
  }
`;

type ShopifyProduct = {
  product: {
    id: string;
    handle: string;
    title: string;
    descriptionHtml: string;
    images: { nodes: { url: string; altText: string | null; width: number; height: number }[] };
    variants: {
      nodes: {
        id: string;
        sku: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
        compareAtPrice: { amount: string; currencyCode: string } | null;
        image: { url: string } | null;
        weight: number | null;
      }[];
    };
  } | null;
};

/**
 * Returns the live Shopify product when credentials exist, otherwise the local
 * model. Always resolves — the landing page must never fail on an API blip.
 */
export async function getProduct(handle = fallback.handle): Promise<Product> {
  const data = await storefront<ShopifyProduct>(PRODUCT_QUERY, { handle });
  const live = data?.product;
  if (!live) return fallback;

  const variants: Variant[] = live.variants.nodes.map((v, i) => ({
    id: v.id,
    sku: v.sku || fallback.variants[i]?.sku || "",
    title: v.title,
    subtitle: fallback.variants[i]?.subtitle ?? "",
    quantity: fallback.variants[i]?.quantity ?? 1,
    price: { amount: Number(v.price.amount), currencyCode: v.price.currencyCode },
    compareAtPrice: v.compareAtPrice
      ? { amount: Number(v.compareAtPrice.amount), currencyCode: v.compareAtPrice.currencyCode }
      : undefined,
    badge: fallback.variants[i]?.badge,
    image: v.image?.url ?? fallback.variants[i]?.image ?? fallback.gallery[0].src,
    availableForSale: v.availableForSale,
    weightGrams: v.weight ?? fallback.variants[i]?.weightGrams ?? 40,
  }));

  return {
    ...fallback,
    id: live.id,
    handle: live.handle,
    title: live.title,
    descriptionHtml: live.descriptionHtml,
    gallery: live.images.nodes.length
      ? live.images.nodes.map((n) => ({
          src: n.url,
          alt: n.altText ?? live.title,
          width: n.width,
          height: n.height,
        }))
      : fallback.gallery,
    variants: variants.length ? variants : fallback.variants,
  };
}

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { message }
    }
  }
`;

/** Creates a Shopify cart and returns the hosted checkout URL. */
export async function createCheckout(variantId: string, quantity = 1): Promise<string | null> {
  const data = await storefront<{
    cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] };
  }>(CART_CREATE, { lines: [{ merchandiseId: variantId, quantity }] }, 0);

  return data?.cartCreate.cart?.checkoutUrl ?? null;
}
