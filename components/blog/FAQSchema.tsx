import type { BlogPost } from "@/content/blog";

/**
 * FAQPage structured data — the schema.org type Google, and increasingly
 * answer/generative engines (ChatGPT, Perplexity, Copilot), use to lift a
 * direct question/answer pair out of a page. Kept as its own script tag
 * rather than merged into BlogPostingSchema's @graph: Google documents
 * FAQPage as a standalone type, and each post's on-page FAQ copy (see
 * app/blog/[slug]/page.tsx) is the visible source of truth this mirrors.
 */
export default function FAQSchema({ post }: { post: BlogPost }) {
  if (!post.faqs || post.faqs.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
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
