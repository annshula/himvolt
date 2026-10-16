/**
 * Bundle packs for products sold as ONE variant at a higher cart quantity: a
 * "3 Pack" is quantity 3 of the same SKU, so the supplier simply ships N
 * units. The savings here only mirror the automatic discounts configured in
 * Shopify Admin (Discounts → "Arm Trainer - Pack 2 Save $19.99": that amount
 * off at quantity 2+; "Arm Trainer - Buy 2 Get 1 Free": buys 2, gets 1 of the
 * same product at 100% off). Shopify gives the shopper whichever is better and
 * is what actually charges. Change them in Shopify and here together, or the
 * price on the page and the price at checkout drift apart.
 *
 * Plain data and arithmetic only, so server and client components share it.
 */

export type PackTier = {
  /** Units in this pack (the cart quantity it sets). */
  size: number;
  /** Units in the pack that cost nothing — 1 for a "buy 2, get 1 free" 3 Pack. */
  freeUnits?: number;
  /** Amount off the whole pack, in the shop currency (what the Shopify discount takes off). */
  saving?: number;
  /** Photo for this pack's card; without one it shows the variant's own image. */
  image?: string;
  /** Merchandising badge on the pack's card, e.g. "Most popular". */
  tag?: string;
};

const tiersByHandle: Record<string, PackTier[]> = {
  // 1 → $79.99, 2 → $139.99, 3 → $159.98 at a $79.99 unit price.
  "hydraulic-arm-trainer": [
    { size: 1 },
    { size: 2, saving: 19.99, image: "/images/arm-trainer/pack-2-two-trainers.webp" },
    {
      size: 3,
      freeUnits: 1,
      tag: "Most popular",
      image: "/images/arm-trainer/pack-3-three-trainers.webp",
    },
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
 * What `quantity` units cost at `unitPrice` (major units, e.g. dollars). Two
 * kinds of saving can apply and Shopify gives the shopper the better of the
 * two, so this does too: the free-unit deal (repeats for every complete set,
 * like Shopify's "buy X get Y", so 4 pays for 3) against the biggest fixed
 * saving whose pack size the quantity has reached. `catalogUnit` is the unit
 * price the savings are written against (the synced shop-currency price); a
 * live price in another currency scales the fixed saving by the same ratio.
 */
export function packTotal(
  tiers: readonly PackTier[] | null | undefined,
  unitPrice: number,
  quantity: number,
  catalogUnit: number = unitPrice,
): number {
  const gross = unitPrice * quantity;
  if (!tiers) return gross;
  const deal = tiers.find((t) => (t.freeUnits ?? 0) > 0);
  const free = deal
    ? Math.floor(quantity / deal.size) * (deal.freeUnits ?? 0)
    : 0;
  let saving = 0;
  for (const t of tiers) {
    if (quantity >= t.size && (t.saving ?? 0) > saving) saving = t.saving ?? 0;
  }
  const scale = catalogUnit > 0 ? unitPrice / catalogUnit : 1;
  return gross - Math.max(free * unitPrice, saving * scale);
}
