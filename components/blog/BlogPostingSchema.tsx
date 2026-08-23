import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
import { blogAuthor, type BlogPost } from "@/content/blog";

/**
 * BlogPosting structured data — the schema.org type Google documents for
 * article rich results. Mirrors the Organization block in components/
 * Schema.tsx rather than referencing it by @id: cross-page @id references
 * do not merge for Google, each page's graph is read independently.
 */
export default function BlogPostingSchema({ post }: { post: BlogPost }) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const imageUrl = absoluteUrl(post.coverImage.src);

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    keywords: [post.targetKeyword, ...post.tags].join(", "),
    author: { "@type": "Organization", name: blogAuthor, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/logo-512.png`, width: 512, height: 512 },
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
