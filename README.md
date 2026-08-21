# HimVolt

Launch site for **HimVolt** — a men's vital brand built around one product: a
square-cut black tourmaline bracelet.

> Lite your life.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Node 20+. No environment variables are required to run — the site falls back to
the local product model in [lib/product.ts](lib/product.ts).

---

## Stack and why

| Choice                                                | Reason                                                                     |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Next.js 15 App Router, React 19                       | Whole page is a static server render; only two components ship JS          |
| TypeScript strict                                     | Product/variant shapes are the contract the Shopify adapter has to satisfy |
| Tailwind CSS v4 (`@theme` tokens)                     | Design tokens live in CSS, so there is no `tailwind.config.js` to drift    |
| CSS scroll-driven animations + `IntersectionObserver` | No animation library. The whole motion system is ~1.5 KB of JS             |
| `next/font` (Sora + Inter)                            | Fonts self-hosted at build time — no third-party request, no FOUT          |
| `next/image` → AVIF/WebP                              | LCP image is served at the exact rendered width                            |

**First Load JS: 114 KB**, of which 102 KB is the React/Next baseline. The page
itself contributes ~12 KB.

No `framer-motion`, no `three.js`, no GSAP. The 3D comes from real CSS 3D
transforms (`perspective` + `preserve-3d` + `translateZ`) driven by CSS custom
properties, which the compositor animates without a single React re-render.

---

## Structure

```
app/
  layout.tsx           metadata, fonts, the `.js` gate for scroll reveals
  page.tsx             composes the sections; static with 1h revalidate
  opengraph-image.tsx  1200×630 social card, generated at build time
  robots.ts sitemap.ts manifest.ts
  api/checkout/        POSTs a variant, returns a Shopify checkout URL
components/
  sections/            Nav, Hero, TrustBar, Showcase, Stone, Features,
                       Collection, Reviews, Faq, FinalCta, Footer
  ui/                  Tilt, VoltField, Counter, Reveal root, Button, Logo…
  Schema.tsx           JSON-LD @graph
content/copy.ts        every word on the page
lib/site.ts            brand config, promises, trust metrics
lib/product.ts         product + variant model (Shopify-shaped)
lib/shopify.ts         Storefront API adapter, dormant until env vars exist
scripts/               build-time image prep (see below)
```

---

## The product images

The supplier photos are white-background studio shots, which look wrong on a
near-black canvas. `scripts/cutout.mjs` keys the background out at build time by
deriving an alpha channel from luminance, then trims and writes transparent
PNGs to `public/product/cutout/`. The stone sits _in_ the page instead of on a
white card.

Two more one-off scripts:

- `scripts/crops.mjs` — the supplier's lifestyle shot has a health claim burnt
  into the top of the image. This crops it off and keeps the wrist composition.
- `scripts/quad.mjs` — the supplier's "4pcs" photo is one bracelet with a red
  `4pcs` label on it. This builds an honest four-band image from the two-band
  cutout instead.

Re-run any of them with `node scripts/<name>.mjs`. Their output is committed, so
you do not need to run them to build.

---

## Connecting Shopify

Everything is already wired. Set two variables and the site switches over:

```bash
SHOPIFY_STORE_DOMAIN=himvolt.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_...
```

- [lib/shopify.ts](lib/shopify.ts) `getProduct()` returns live product data in
  the exact shape components already consume. No component changes needed.
- `createCheckout()` creates a cart and returns the hosted checkout URL.
- [app/api/checkout/route.ts](app/api/checkout/route.ts) is what the Add to bag
  button calls. Without credentials it returns an honest "checkout opens
  shortly" message rather than pretending to add to a bag.

Product SKUs are already the real CJDropshipping ones
(`CJSL278251902BY` / `CJSL278251901AZ` / `CJSL278251903CX`), so they map
one-to-one onto Shopify variants.

---

## Before you go live — read this

Three things on this site are **placeholders you must replace**, and two of them
carry legal risk if you don't.

### 1. Trust metrics — `lib/site.ts`

```ts
metrics: {
  verified: false,      // ← leave false until the numbers are real
  rating: 4.8,
  reviewCount: 2914,
  unitsWorn: 41000,
  countries: 38,
}
```

While `verified` is `false`, [components/Schema.tsx](components/Schema.tsx)
**omits `aggregateRating` from the structured data**. That is deliberate.
Marking up a rating you cannot evidence gets every rich result on the domain
suppressed by Google, and in the US it is an FTC matter. Flip `verified` to
`true` only when the figures come from a real review platform.

### 2. Testimonials — `content/copy.ts`

The six reviews are written examples of the voice you want, not real customers.
Replace all six before launch.

### 3. Shipping and returns promises — `lib/site.ts`

"Free tracked shipping worldwide", "5–9 business days", "30-day returns, we pay
the label", "12-month restring guarantee". Every one of these is a promise the
page makes on your behalf, and CJDropshipping's real transit times are usually
longer than 5–9 days. Either negotiate the fulfilment that makes them true, or
change the numbers.

### Claims policy

The copy describes black tourmaline by its verifiable mineral properties —
7–7.5 Mohs, pyroelectric, piezoelectric — and by what people traditionally wear
it for. It makes **no health, medical or therapeutic claim**, and the "What we
will not claim" block says so out loud. The footer carries a matching
disclaimer. Keep it that way; it is both the safe position and, on cold traffic,
the more persuasive one.

---

## Accessibility and resilience

- Scroll reveals are gated behind a `.js` class on `<html>`. With scripting off,
  nothing is hidden.
- FAQ uses native `<details>`/`<summary>` — keyboard-accessible, and every
  answer stays in the DOM for crawlers.
- `prefers-reduced-motion: reduce` disables the ember canvas, the float loops
  and every transition.
- Skip link, focus-visible rings, `aria-label`s on star ratings and icon-only
  controls.
- Dark-only by design; `color-scheme: dark` is declared so form controls match.
