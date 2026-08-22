import type { MetadataRoute } from "next";
import { product } from "@/lib/product";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
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
    {
      url: `${site.url}/products/${product.handle}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
