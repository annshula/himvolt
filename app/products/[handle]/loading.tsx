/**
 * Route-level Suspense fallback for /products/[handle] — shown only while
 * the page's own `await getProduct(handle)` (live Shopify price/stock) is
 * in flight, then swapped for the real content. SEO-safe by construction:
 * this never replaces or delays real text in the response a crawler
 * indexes, it's the standard Next.js streaming-SSR loading state, and the
 * final HTML a bot sees is identical to what it always was.
 *
 * Shapes roughly mirror ProductPurchase's actual layout (gallery left,
 * title/price/buy box/description right) so the swap doesn't jump the page.
 */
export default function ProductLoading() {
  return (
    <main>
      <div className="mx-auto w-full max-w-310 px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="skeleton h-3.5 w-48 rounded-full" />
      </div>

      <div className="mx-auto grid w-full max-w-310 gap-12 px-5 pt-8 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-10 lg:pb-24">
        {/* gallery: thumbnail rail + main image */}
        <div className="flex flex-col-reverse gap-4 lg:flex-row">
          <div className="flex w-full gap-2.5 p-1 lg:w-19 lg:shrink-0 lg:flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="skeleton size-14 shrink-0 rounded-lg sm:size-16"
              />
            ))}
          </div>
          <div className="skeleton mx-auto aspect-square w-full max-w-115 rounded-(--radius-card)" />
        </div>

        {/* title, price, buy box, description */}
        <div>
          <div className="skeleton h-9 w-3/4 max-w-100 rounded-full" />
          <div className="skeleton mt-3 h-4 w-1/2 max-w-70 rounded-full" />

          <div className="mt-7">
            <div className="skeleton h-7 w-28 rounded-full" />
            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-24 rounded-full" />
              ))}
            </div>
            <div className="skeleton mt-6 h-13 w-full rounded-full" />
            <div className="skeleton mt-3 h-13 w-full rounded-full" />
          </div>

          <div className="mt-8 max-w-[52ch] space-y-3">
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-2/3 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
