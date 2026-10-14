/**
 * Selected-country cookie. Stores only an ISO country code the shopper picked
 * (e.g. "CA") — never a currency amount or rate. Every price shown for that
 * choice is fetched live from Shopify via @inContext; this cookie just says
 * which country to ask Shopify for.
 */

import { cookies, headers } from "next/headers";

import { detectVisitorCountry } from "@/lib/localization/geo";

const COUNTRY_COOKIE = "_hv_country";

/**
 * The nav no longer offers a currency switch, so the visitor's GeoIP country
 * is the only thing that decides their currency. A cookie written back when
 * the selector existed (it lasts a year) must not keep overriding it — that
 * pinned returning visitors to whatever they once picked, with no way left to
 * change it. Flip to true only together with bringing the selector back.
 */
export const COUNTRY_SELECTOR_ENABLED = false;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function readSelectedCountry(): Promise<string | null> {
  if (!COUNTRY_SELECTOR_ENABLED) return null;
  const store = await cookies();
  return store.get(COUNTRY_COOKIE)?.value ?? null;
}

export async function writeSelectedCountry(isoCode: string): Promise<void> {
  if (!COUNTRY_SELECTOR_ENABLED) return;
  const store = await cookies();
  store.set(COUNTRY_COOKIE, isoCode, cookieOptions);
}

/** "Auto" — clears the manual override so Shopify's own default market applies. */
export async function clearSelectedCountry(): Promise<void> {
  const store = await cookies();
  store.delete(COUNTRY_COOKIE);
}

/**
 * The country that should actually drive pricing: the visitor's explicit
 * choice if they made one, otherwise the edge-geolocated country from request
 * headers — so an unconfirmed auto-detection still gets real
 * Shopify-converted prices. Both the live price API and checkout use this
 * one function, which is what keeps the cart's total equal to the price the
 * page showed.
 */
export async function resolveEffectiveCountry(): Promise<string | null> {
  const selected = await readSelectedCountry();
  if (selected) return selected;
  const headerList = await headers();
  return detectVisitorCountry(headerList);
}
