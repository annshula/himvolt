import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Motion";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/product";

/**
 * The listing card. One product today, but the shape is a real grid card —
 * cover photo, name, "from" price, view arrow — so a second SKU drops in
 * without a redesign. Capped narrow from sm up on purpose: a single card
 * should read as a compact tile, not stretch to fill a two/three-column
 * grid cell on its own. Below sm the grid is a single column, so the cap
 * comes off and the card fills its cell instead of sitting cramped and
 * left-aligned in it.
 */
export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce((min, v) =>
    v.price.amount < min.price.amount ? v : min,
  );
  const cover = product.gallery[0];
  const isBestSeller = product.handle === "hematite-mens-bracelet";

  return (
    <Reveal as="article" className="w-full sm:max-w-72">
      <Link
        href={`/products/${product.handle}`}
        className="group block overflow-hidden rounded-(--radius-card) border border-line bg-linen transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15 hover:shadow-(--shadow-e3)"
      >
        <div className="relative aspect-square overflow-hidden bg-parchment">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 639px) 92vw, 288px"
            className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-105"
          />
          {isBestSeller && (
            <span className="absolute top-3 left-3 z-10 rounded-full border border-[#1c1917]/20 bg-[#f4c542] px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.14em] text-[#1c1917] uppercase shadow-(--shadow-e2)">
              BEST SELLER
            </span>
          )}
        </div>

        <div className="p-4">
          <h2 className="font-display text-[0.95rem] leading-tight font-bold tracking-[-0.02em] text-ink">
            {product.title}
          </h2>
          <p className="mt-1 text-[0.72rem] text-ink-mute">
            {product.subtitle}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-[0.92rem] font-semibold tracking-[-0.02em] text-ink">
              From{" "}
              {formatMoney(cheapest.price.amount, cheapest.price.currencyCode)}
            </span>
            <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold tracking-[0.08em] text-volt uppercase">
              View
              <ArrowIcon className="h-3 w-3 transition-transform duration-400 ease-(--ease-out-expo) group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
