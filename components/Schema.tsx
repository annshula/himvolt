import { site } from "@/lib/site";
import { faqs } from "@/content/copy";

/**
 * Structured data for the home page — Organization, WebSite and the FAQPage
 * (the FAQ section lives on home). Product/Offer markup lives on the product
 * page itself (components/ProductSchema.tsx), not here: the home page
 * explains the product, it does not sell it, and Google's guidance is that
 * Product structured data belongs on the page the product is actually
 * transacted on.
 */
export default function Schema() {
  const url = site.url;

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
