"use client";

import { useState } from "react";

import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/product";

/** A long merchant-supplied title needs a smaller ceiling than a short one — otherwise it wraps into a wall of oversized text at the default clamp's 2rem floor. Three fluid bands keyed to length, each still shrinking further on narrow viewports via its own clamp vw term. */
function titleSizeClass(title: string) {
  if (title.length > 90) return "text-[clamp(1.3rem,1rem+1.1vw,1.7rem)]";
  if (title.length > 55) return "text-[clamp(1.6rem,1.1rem+1.6vw,2.2rem)]";
  return "text-[clamp(2rem,1.3rem+2.4vw,3rem)]";
}

/**
 * Gallery + buy box as one coordinated unit — both need to agree on which
 * variant is selected (picking a colour swatch in BuyBox should move
 * ProductGallery's main image to match it), so the selected variant id lives
 * here, one level above both, rather than duplicated as separate internal
 * state in each.
 */
export function ProductPurchase({ product }: { product: Product }) {
  // Default to whichever variant carries the deepest real discount (a BOGO
  // or bundle deal) rather than always the first — that's the offer worth
  // leading with. Sold-out variants can't be ordered, so they're excluded
  // from the default unless every variant is sold out (then the picker still
  // has to show something). Falls back to the first variant when nothing is
  // discounted, so a plain single-SKU product is unaffected.
  const buyable = product.variants.filter((v) => v.availableForSale);
  const candidates = buyable.length > 0 ? buyable : product.variants;
  const bestDeal = candidates.reduce((best, v) => {
    const pct =
      v.compareAtPrice && v.compareAtPrice.amount > v.price.amount
        ? 1 - v.price.amount / v.compareAtPrice.amount
        : 0;
    const bestPct =
      best.compareAtPrice && best.compareAtPrice.amount > best.price.amount
        ? 1 - best.price.amount / best.compareAtPrice.amount
        : 0;
    return pct > bestPct ? v : best;
  }, candidates[0]);
  const [selectedId, setSelectedId] = useState(bestDeal.id);
  const selected =
    product.variants.find((v) => v.id === selectedId) ?? product.variants[0];

  return (
    <div className="mx-auto grid w-full max-w-310 gap-12 px-5 pt-8 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-10 lg:pb-24">
      <ProductGallery product={product} activeSrc={selected.image} />

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div>
          <h1
            className={cn(
              "font-display leading-[1.05] font-extrabold tracking-[-0.04em] text-ink text-balance",
              titleSizeClass(product.title),
            )}
          >
            {product.title}
          </h1>
          <p className="mt-2 text-[0.95rem] text-ink-soft">
            {product.subtitle}
          </p>
        </div>

        <div className="mt-7">
          <BuyBox
            product={product}
            selectedId={selectedId}
            onSelectId={setSelectedId}
          />
        </div>

        <div
          className="mt-8 max-w-[52ch] text-[0.9rem] leading-[1.65] text-ink-soft [&_p]:mt-3 [&_p:first-child]:mt-0"
          dangerouslySetInnerHTML={{
            // Description HTML originates in the shared Shopify store and is
            // merchant-controlled, never end-user input. It's sanitized once,
            // at the trust boundary, in lib/sanitize-html.ts's
            // sanitizeProductHtml() — called from lib/shopify/sync-product.ts
            // before this ever reaches data/product.json. Re-sanitizing
            // already-clean local data here would just pull an HTML-parsing
            // library into the client bundle for no benefit — same trust
            // model as content/blog.ts's post bodies.
            __html: product.descriptionHtml,
          }}
        />
      </div>
    </div>
  );
}
