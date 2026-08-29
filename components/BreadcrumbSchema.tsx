import { absoluteUrl } from "@/lib/seo";

/**
 * BreadcrumbList structured data — powers Google's breadcrumb rich result
 * and gives answer/generative engines an explicit site-hierarchy signal
 * (this page sits under Blog, this one under Shop) beyond what they'd infer
 * from the URL alone. `items` mirrors the visible breadcrumb nav already on
 * each page — kept as separate props here rather than reused directly so
 * this component has no JSX dependency on any one page's markup.
 */
export default function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Content is fully author-controlled; no user input reaches this string.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
