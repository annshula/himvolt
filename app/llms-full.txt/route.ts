import { blogPosts } from "@/content/blog";
import { faqs } from "@/content/copy";
import { products } from "@/lib/product";
import { site } from "@/lib/site";

export const revalidate = 3600;

/**
 * /llms-full.txt — the expanded llmstxt.org variant of /llms.txt: full
 * product descriptions and full blog post bodies inline, rather than the
 * truncated summaries in /llms.txt, so a model can answer from this one file
 * without a further fetch. Same data sources as llms.txt so it can never
 * drift out of sync with what a visitor sees.
 */
function buildLlmsFullTxt(): string {
  const lines: string[] = [];

  lines.push(`# ${site.name} — full content`);
  lines.push("");
  lines.push(`> ${site.description}`);
  lines.push("");
  lines.push(
    `${site.name} sells genuine natural hematite — iron(III) oxide, Fe₂O₃ — cut and polished into bracelets and rings for men. Claim policy: mineral properties (composition, hardness, density, the streak test, magnetism) are stated as fact; grounding, focus, and protective meaning are stated as tradition dating to antiquity, never as a medical or clinical outcome. Where a listing is magnetic, that is a man-made magnetic composite (often called hematine), not the natural stone, and the product page says so plainly.`,
  );
  lines.push("");

  lines.push("## Products");
  lines.push("");
  for (const p of products) {
    const prices = p.variants.map((v) => v.price.amount);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const priceLabel = low === high ? `$${low}` : `$${low}–$${high}`;
    const plain = p.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    lines.push(`### ${p.title}`);
    lines.push(`${site.url}/products/${p.handle}`);
    lines.push(`${p.subtitle} — ${p.material}, ${priceLabel}.`);
    lines.push("");
    lines.push(plain);
    lines.push("");
  }

  lines.push("## Guides");
  lines.push("");
  for (const post of [...blogPosts].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))) {
    lines.push(`### ${post.title}`);
    lines.push(`${site.url}/blog/${post.slug}`);
    lines.push(`Published ${post.publishedAt}, updated ${post.updatedAt}.`);
    lines.push("");
    lines.push(post.body.trim());
    lines.push("");
  }

  lines.push("## Frequently asked questions");
  lines.push("");
  for (const f of faqs) {
    lines.push(`**${f.q}**`);
    lines.push(f.a);
    lines.push("");
  }

  lines.push("## Policies");
  lines.push("");
  lines.push(`- Shipping: ${site.promise.shippingFull}`);
  lines.push(`- Returns: ${site.promise.returnsDetail}`);
  lines.push(`- Durability: ${site.promise.durability}`);
  lines.push(`- Support: ${site.promise.support} — ${site.email}`);
  lines.push("");

  lines.push("## Other");
  lines.push("");
  lines.push(`- [Sitemap](${site.url}/sitemap.xml)`);
  lines.push(`- [About](${site.url}/about)`);
  lines.push(`- [Contact](${site.url}/contact)`);
  lines.push(`- [Condensed index](${site.url}/llms-small.txt)`);

  return lines.join("\n") + "\n";
}

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
