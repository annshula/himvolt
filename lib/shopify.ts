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

import { syncedProduct } from "./catalog";
import { product as fallback, type Product, type Variant } from "./product";

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

const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      images(first: 8) {
        nodes {
          url
          altText
          width
          height
        }
      }
      variants(first: 12) {
        nodes {
          id
          sku
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
          }
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
    images: {
      nodes: {
        url: string;
        altText: string | null;
        width: number;
        height: number;
      }[];
    };
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
 * Returns the live Shopify product when credentials exist, otherwise the
 * synced catalog. Always resolves — the landing page must never fail on an
 * API blip.
 *
 * The synced catalog (data/product.json) is the ground truth for variant ids:
 * every variant handed to the cart/checkout must be a real Shopify
 * `gid://shopify/ProductVariant/…`, or the drawer and Storefront checkout
 * cannot resolve it. The live Storefront query only refreshes prices,
 * availability and imagery on top of those ids.
 */
export async function getProduct(
  handle: string = syncedProduct.handle,
): Promise<Product> {
  const data = await storefront<ShopifyProduct>(PRODUCT_QUERY, { handle });
  const live = data?.product;
  const liveVariants = live?.variants?.nodes ?? [];
  const currency = syncedProduct.currencyCode ?? "USD";

  const variants: Variant[] = syncedProduct.variants.map((synced, i) => {
    const pres = fallback.variants[i];
    const liveV = liveVariants[i];
    return {
      // Real Shopify gid — the cart + checkout resolve against data/product.json.
      id: synced.id,
      sku: pres?.sku ?? synced.title,
      // Keep the local presentation title ("One band") over the raw Shopify
      // option title ("Square Bracelet / 1PCS") — ids stay real.
      title: pres?.title ?? synced.title,
      subtitle: pres?.subtitle ?? "",
      quantity: pres?.quantity ?? 1,
      price: liveV
        ? {
            amount: Number(liveV.price.amount),
            currencyCode: liveV.price.currencyCode,
          }
        : { amount: synced.price, currencyCode: currency },
      compareAtPrice: liveV?.compareAtPrice
        ? {
            amount: Number(liveV.compareAtPrice.amount),
            currencyCode: liveV.compareAtPrice.currencyCode,
          }
        : synced.compareAtPrice != null
          ? { amount: synced.compareAtPrice, currencyCode: currency }
          : undefined,
      badge: pres?.badge,
      image: liveV?.image?.url ?? pres?.image ?? fallback.gallery[0]?.src ?? "",
      availableForSale: liveV?.availableForSale ?? synced.availableForSale,
      weightGrams: liveV?.weight ?? pres?.weightGrams ?? 40,
    };
  });

  return {
    ...fallback,
    id: live?.id ?? syncedProduct.id,
    handle: live?.handle ?? syncedProduct.handle,
    title: live?.title ?? syncedProduct.title,
    descriptionHtml: live?.descriptionHtml ?? fallback.descriptionHtml,
    gallery: live?.images?.nodes?.length
      ? live.images.nodes.map((n) => ({
          src: n.url,
          alt: n.altText ?? live.title ?? fallback.title,
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
