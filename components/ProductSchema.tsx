import { site } from "@/lib/site";
import { ALL_COUNTRY_CODES, transitForHandle } from "@/lib/shipping";
import { plainDescription, type Product } from "@/lib/product";

/**
 * Structured data for the product page. Split out from components/Schema.tsx
 * (Organization/WebSite/FAQPage, mounted on home) because Product/Offer
 * markup belongs on the page the product is actually bought on.
 *
 * AggregateRating is intentionally conditional. Marking up ratings you cannot
 * evidence is the fastest way to get every rich result on the domain
 * suppressed — and it is an FTC matter in the US. Flip `site.metrics.verified`
 * only when the numbers come out of a real review platform.
 */
export default function ProductSchema({ product }: { product: Product }) {
  const url = site.url;
  const productUrl = `${url}/products/${product.handle}`;
  const prices = product.variants.map((v) => v.price.amount);

  // Shipping is worldwide, so every country is listed — nothing to update when
  // a new country is enabled, and no dependence on Shopify Markets. One entry
  // per distinct window: the US and the rest of the world differ for the arm trainer.
  const shippingGroups = [
    { countries: ["US"], transit: transitForHandle(product.handle, "US") },
    { countries: ALL_COUNTRY_CODES.filter((c) => c !== "US"), transit: transitForHandle(product.handle, null) },
  ];

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}/#product`,
    name: product.title,
    description: plainDescription(product),
    sku: product.variants[0].sku,
    brand: { "@type": "Brand", name: site.name },
    material: product.material,
    color: "Black",
    audience: { "@type": "PeopleAudience", suggestedGender: "male" },
    // Gallery images may already be absolute (Shopify CDN) or site-relative
    // (local /product art) — never blindly prefix, or an absolute URL turns
    // into "https://himvolt.com/https://cdn.shopify.com/...".
    image: product.gallery.map((g) => (g.src.startsWith("http") ? g.src : `${url}${g.src}`)),
    ...(site.metrics.verified
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: site.metrics.rating,
            reviewCount: site.metrics.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "AggregateOffer",
      url: productUrl,
      priceCurrency: site.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: "https://schema.org/InStock",
      seller: { "@id": `${url}/#organization` },
      offers: product.variants.map((v) => ({
        "@type": "Offer",
        sku: v.sku,
        name: v.title,
        price: v.price.amount,
        priceCurrency: v.price.currencyCode,
        availability: v.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        shippingDetails: shippingGroups.map(({ countries, transit }) => ({
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: site.currency },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: countries },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: transit.minDays,
              maxValue: transit.maxDays,
              unitCode: "DAY",
            },
          },
        })),
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: ["US", "GB", "CA", "AU", "DE", "FR"],
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 60,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      // Content is fully author-controlled; no user input reaches this string.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
