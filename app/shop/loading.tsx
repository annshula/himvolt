/**
 * Route-level Suspense fallback for /shop — shown only while the page's own
 * `await Promise.all(products.map(getProduct))` (live Shopify price/stock
 * for every card) is in flight. SEO-safe by construction: this never
 * replaces or delays real text in the response a crawler indexes, it's the
 * standard Next.js streaming-SSR loading state — the final HTML a bot sees
 * is identical to what it always was.
 *
 * Card shape mirrors ProductCard so the swap doesn't jump the page.
 */
export default function ShopLoading() {
  return (
    <main>
      <div className="mx-auto w-full max-w-310 px-5 pt-12 pb-2 sm:px-8 sm:pt-16">
        <div className="skeleton h-3.5 w-32 rounded-full" />
        <div className="skeleton mt-7 h-10 w-56 rounded-full" />
        <div className="skeleton mt-3 h-4 w-80 max-w-full rounded-full" />
      </div>

      <div className="mx-auto w-full max-w-310 px-5 pt-10 pb-24 sm:px-8 lg:pb-32">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full overflow-hidden rounded-(--radius-card) border border-line sm:max-w-72"
            >
              <div className="skeleton aspect-square w-full" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-3/4 rounded-full" />
                <div className="skeleton h-3 w-1/2 rounded-full" />
                <div className="skeleton mt-2 h-4 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
