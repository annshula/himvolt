/**
 * Bundle packs for products sold as ONE variant at a higher cart quantity: a
 * "3 Pack" is quantity 3 of the same SKU, so the supplier simply ships N
 * units. The pack sizes, free units and percentages here only mirror the
 * automatic discounts configured in Shopify Admin (Discounts → "Arm Trainer -
 * Buy 2 Get 1 Free": buys 2, gets 1 of the same product at 100% off; and "Arm
 * Trainer - Buy 2 Save 5%": 5% off at quantity 2+). Shopify gives the shopper
 * whichever is better and is what actually charges. Change them in Shopify and
 * here together, or the price on the page and the price at checkout drift apart.
 *
 * Plain data and arithmetic only, so server and client components share it.
 */

export type PackTier = {
  /** Units in this pack (the cart quantity it sets). */
  size: number;
  /** Units in the pack that cost nothing — 1 for a "buy 2, get 1 free" 3 Pack. */
  freeUnits: number;
  /** Percent off the whole pack — the "small discount" on the 2 Pack. */
  discountPercent?: number;
  /** Merchandising badge on the pack's card, e.g. "Most popular". */
  tag?: string;
};

const tiersByHandle: Record<string, PackTier[]> = {
  "hydraulic-arm-trainer": [
    { size: 1, freeUnits: 0 },
    { size: 2, freeUnits: 0, discountPercent: 5 },
    { size: 3, freeUnits: 1, tag: "Most popular" },
  ],
};

/** The pack ladder for a product, or null when it is sold the ordinary way. */
export function packTiersFor(handle: string): PackTier[] | null {
  return tiersByHandle[handle] ?? null;
}

/** The pack the page opens on: the tagged one, otherwise the single unit. */
export function defaultPackSize(tiers: readonly PackTier[]): number {
  return tiers.find((t) => t.tag)?.size ?? tiers[0]?.size ?? 1;
}

/**
 * What `quantity` units cost at `unitPrice` (in major units, e.g. dollars). Two discounts can
 * apply and Shopify gives the shopper the better one, so this does too: the
 * free-unit deal (which repeats for every complete set, like Shopify's "buy X
 * get Y", so 4 pays for 3 and 6 pays for 4) against the highest reached
 * percentage tier.
 */
export function packTotal(
  tiers: readonly PackTier[] | null | undefined,
  unitPrice: number,
  quantity: number,
): number {
  if (!tiers) return unitPrice * quantity;
  const deal = tiers.find((t) => t.freeUnits > 0);
  const paid = deal
    ? quantity - Math.floor(quantity / deal.size) * deal.freeUnits
    : quantity;
  let percent = 0;
  for (const t of tiers) {
    if (quantity >= t.size && (t.discountPercent ?? 0) > percent) {
      percent = t.discountPercent ?? 0;
    }
  }
  // Shopify takes the percentage off each unit and drops the fraction of a
  // cent (5% of 79.99 is 3.9995, taken as 3.99), so do the same per unit:
  // otherwise the page and the checkout differ by a cent or two.
  const cents = Math.round(unitPrice * 100);
  const percentUnit = (cents - Math.floor((cents * percent) / 100 + 1e-9)) / 100;
  return Math.min(unitPrice * paid, percentUnit * quantity);
}
