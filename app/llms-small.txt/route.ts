import { blogPosts } from "@/content/blog";
import { products } from "@/lib/product";
import { site } from "@/lib/site";

export const revalidate = 3600;

/**
 * /llms-small.txt — a condensed, link-only variant of /llms.txt for models or
 * retrieval systems that want the site map without prose. Same data sources
 * as llms.txt so it can never drift out of sync.
 */
function buildLlmsSmallTxt(): string {
  const lines: string[] = [];

  lines.push(`# ${site.name} — condensed index`);
  lines.push("");
  lines.push(`> ${site.description}`);
  lines.push("");

  lines.push("## Products");
  for (const p of products) {
    lines.push(`- [${p.title}](${site.url}/products/${p.handle})`);
  }
  lines.push("");

  lines.push("## Guides");
  for (const post of [...blogPosts].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))) {
    lines.push(`- [${post.title}](${site.url}/blog/${post.slug})`);
  }
  lines.push("");

  lines.push("## Other");
  lines.push(`- [Shop](${site.url}/shop)`);
  lines.push(`- [About](${site.url}/about)`);
  lines.push(`- [Contact](${site.url}/contact)`);
  lines.push(`- [Full guide](${site.url}/llms-full.txt)`);
  lines.push(`- [Sitemap](${site.url}/sitemap.xml)`);

  return lines.join("\n") + "\n";
}

export function GET() {
  return new Response(buildLlmsSmallTxt(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
