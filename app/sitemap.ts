import type { MetadataRoute } from "next";
import { blogPosts } from "@/content/blog";
import { LEGAL_PAGES } from "@/content/legal";
import { getLiveProducts } from "@/lib/product-live";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // Live-synced handles (see lib/product.ts's getLiveProducts doc) — a
  // product added via the admin sync or a Shopify webhook shows up here
  // without waiting for a redeploy, unlike pricing-bearing pages.
  const products = await getLiveProducts();
  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/shop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...products.map((p) => ({
      url: `${site.url}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1,
    })),
    {
      url: `${site.url}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${site.url}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...blogPosts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [`${site.url}${post.coverImage.src}`],
    })),
    ...LEGAL_PAGES.map((page) => ({
      url: `${site.url}/${page.slug}`,
      lastModified: new Date(page.lastUpdated),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
