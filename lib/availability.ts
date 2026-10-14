/**
 * Country availability for a product, as set in Shopify
 * (custom.available_countries → Product.availableCountries).
 *
 * This is a storefront-level restriction, decided from the visitor's GeoIP
 * country — a shopper using a VPN can look past it. The hard stop is a
 * matching shipping profile in Shopify; this is the part that keeps an
 * unsupported visitor from putting the item in a bag in the first place.
 *
 * An unknown location (no GeoIP header, e.g. localhost) is never treated as
 * restricted: not knowing where someone is isn't a reason to block them.
 */

/** True when `allowed` lists countries and `country` is known and not one of them. */
export function isRestricted(
  allowed: string[] | null | undefined,
  country: string | null | undefined,
): boolean {
  if (!allowed || allowed.length === 0) return false;
  if (!country) return false;
  return !allowed.includes(country.toUpperCase());
}

/** "United States", "Canada and Australia" — region names for a list of ISO codes. */
export function countryNames(codes: string[]): string {
  let names: string[];
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    names = codes.map((c) => display.of(c) ?? c);
  } catch {
    names = codes;
  }
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
