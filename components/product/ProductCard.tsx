import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Motion";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/product";

/**
 * The listing card. One product today, but the shape is a real grid card —
 * cover photo, name, "from" price, view arrow — so a second SKU drops in
 * without a redesign. Capped narrow on purpose: a single card should read as
 * a compact tile, not stretch to fill a three-column grid cell on its own.
 */
export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce((min, v) =>
    v.price.amount < min.price.amount ? v : min,
  );
  const cover = product.gallery[0];

  return (
    <Reveal as="article" className="max-w-72">
      <Link
        href={`/products/${product.handle}`}
        className="group block overflow-hidden rounded-(--radius-card) border border-line bg-linen transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15 hover:shadow-(--shadow-e3)"
      >
        <div className="relative aspect-square overflow-hidden bg-parchment">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 639px) 80vw, 288px"
            className="object-contain p-7 transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-105"
          />
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
              From {formatMoney(cheapest.price.amount, cheapest.price.currencyCode)}
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
