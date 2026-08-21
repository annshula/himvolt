import { site } from "@/lib/site";
import { faqs } from "@/content/copy";
import type { Product } from "@/lib/product";

/**
 * Structured data, emitted as one @graph so Google parses a single connected
 * entity set rather than four loose blobs.
 *
 * AggregateRating is intentionally conditional. Marking up ratings you cannot
 * evidence is the fastest way to get every rich result on the domain
 * suppressed — and it is an FTC matter in the US. Flip `site.metrics.verified`
 * only when the numbers come out of a real review platform.
 */
export default function Schema({ product }: { product: Product }) {
  const url = site.url;
  const productUrl = `${url}/#product`;

  const prices = product.variants.map((v) => v.price.amount);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${url}/#organization`,
      name: site.name,
      legalName: site.legalName,
      url,
      slogan: site.tagline,
      description: site.description,
      logo: { "@type": "ImageObject", url: `${url}/logo-512.png`, width: 512, height: 512 },
      email: site.email,
      sameAs: Object.values(site.socials),
    },
    {
      "@type": "WebSite",
      "@id": `${url}/#website`,
      url,
      name: site.name,
      description: site.description,
      publisher: { "@id": `${url}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "Product",
      "@id": productUrl,
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
        url: `${url}/#collection`,
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
    },
    {
      "@type": "FAQPage",
      "@id": `${url}/#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Content is fully author-controlled; no user input reaches this string.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
