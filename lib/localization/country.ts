/**
 * Selected-country cookie. Stores only an ISO country code the shopper picked
 * (e.g. "CA") — never a currency amount or rate. The price for that choice
 * comes from the synced catalog (lib/catalog.ts's priceForMarket); this
 * cookie just says which country's price to look up.
 */

import { cookies } from "next/headers";

const COUNTRY_COOKIE = "_hv_country";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function readSelectedCountry(): Promise<string | null> {
  const store = await cookies();
  return store.get(COUNTRY_COOKIE)?.value ?? null;
}

export async function writeSelectedCountry(isoCode: string): Promise<void> {
  const store = await cookies();
  store.set(COUNTRY_COOKIE, isoCode, cookieOptions);
}

/** "Auto" — clears the manual override so Shopify's own default market applies. */
export async function clearSelectedCountry(): Promise<void> {
  const store = await cookies();
  store.delete(COUNTRY_COOKIE);
}
