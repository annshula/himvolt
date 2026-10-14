/**
 * Region names for the countries a product ships to (custom.available_countries
 * in Shopify → Product.availableCountries). The site only *labels* a limited
 * product; Shopify enforces it at checkout through the product's shipping
 * profile, by shipping address.
 */

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
