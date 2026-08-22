import { site } from "@/lib/site";
import type { Product } from "@/lib/product";

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

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}/#product`,
    name: product.title,
    description: product.descriptionHtml.replace(/<[^>]+>/g, ""),
    sku: product.variants[0].sku,
    brand: { "@type": "Brand", name: site.name },
    material: product.material,
    color: "Black",
    audience: { "@type": "PeopleAudience", suggestedGender: "male" },
    image: product.gallery.map((g) => `${url}${g.src}`),
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
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: site.currency },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: ["US", "GB", "CA", "AU", "DE", "FR"] },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 9, unitCode: "DAY" },
          },
        },
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
