import { getProductForVariant } from "@/lib/catalog";

/**
 * The country a bag has to be priced and checked out in.
 *
 * A product limited to some countries (custom.available_countries in Shopify)
 * is *unavailable* in any other country's context: a cart created for, say,
 * Canada loses the line and Shopify's checkout opens on "Out of stock" without
 * ever asking for an address. So when a bag holds such a product and the
 * visitor's own country isn't one it ships to, the cart is created for the
 * first country it does ship to — the buyer then enters their delivery
 * address, and Shopify's shipping profile accepts or declines it by address.
 *
 * Returns `country` unchanged when nothing in the bag is limited, or when the
 * visitor's country is already allowed.
 */
export function shipCountryFor(
  variantIds: string[],
  country: string | null,
): string | null {
  for (const id of variantIds) {
    const allowed = getProductForVariant(id)?.availableCountries ?? [];
    if (allowed.length > 0 && (!country || !allowed.includes(country))) {
      return allowed[0];
    }
  }
  return country;
}
