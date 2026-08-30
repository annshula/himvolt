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
      logo: {
        "@type": "ImageObject",
        url: `${url}/logo-512.webp`,
        width: 512,
        height: 512,
      },
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
      about: { "@id": `${url}/#hematite` },
      inLanguage: "en",
    },
    {
      "@type": "Thing",
      "@id": `${url}/#hematite`,
      name: "Hematite",
      alternateName: "Iron(III) oxide",
      sameAs: [
        "https://en.wikipedia.org/wiki/Hematite",
        "https://www.wikidata.org/wiki/Q83437",
      ],
      identifier: "Fe2O3",
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
    {
      "@type": "HowTo",
      "@id": `${url}/#how-to-wear`,
      name: "How to wear and care for a hematite bracelet",
      description:
        "How to fit, put on and maintain a genuine hematite (iron oxide) bracelet with a stretch elastic core.",
      step: [
        {
          "@type": "HowToStep",
          name: "Confirm your fit",
          text: "Bracelets use a stretch elastic core that fits most adult wrists with no sizing chart. Rings run true to standard US sizing 6–12 and do not stretch, so check your ring size before ordering.",
        },
        {
          "@type": "HowToStep",
          name: "Put it on",
          text: "There is no clasp to fasten. Stretch the band open and roll it onto your wrist, or slide a ring on as you would any fitted ring.",
        },
        {
          "@type": "HowToStep",
          name: "Care for it daily",
          text: "Hematite is non-porous — rinse it under water and wipe with a cloth as needed. Avoid prolonged contact with harsh soaps or chlorine, and avoid hard impacts against tile or metal: at 5.5–6.5 on the Mohs scale hematite is hard but can chip like any polished stone.",
        },
        {
          "@type": "HowToStep",
          name: "Verify it is genuine hematite",
          text: "A light scratch on an inconspicuous spot should leave a red-brown streak — the iron oxide underneath the metallic black-grey surface. Coated glass or resin will not streak red-brown.",
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Content is fully author-controlled; no user input reaches this string.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
