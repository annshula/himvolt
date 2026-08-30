import { blogPosts } from "@/content/blog";
import { faqs } from "@/content/copy";
import { getLiveProducts } from "@/lib/product-live";
import type { Product } from "@/lib/product";
import { site } from "@/lib/site";

export const revalidate = 3600;

/**
 * /llms.txt — the emerging llmstxt.org convention: a plain-markdown map of
 * the site for LLM-based answer/generative engines (ChatGPT browsing,
 * Claude, Perplexity, …) to read instead of crawling and parsing full HTML.
 * Generated from the same data the pages themselves render from (products,
 * blogPosts, faqs) so it can never drift out of sync with what a visitor —
 * or a structured-data crawler — actually sees. Products come from
 * getLiveProducts() (lib/product.ts) rather than the plain build-time
 * `products` export, so a sync that ran after the last deploy shows up here
 * without a redeploy — this is informational text only, no cart/checkout
 * path depends on the price shown here, so it's safe to read live.
 */
function buildLlmsTxt(products: Product[]): string {
  const lines: string[] = [];

  lines.push(`# ${site.name}`);
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
    lines.push(
      `- [${p.title}](${site.url}/products/${p.handle}): ${p.subtitle} — ${p.material}, ${priceLabel}. ${plain.slice(0, 200)}${plain.length > 200 ? "…" : ""}`,
    );
  }
  lines.push("");

  lines.push("## Guides");
  lines.push("");
  lines.push(
    "Editorial posts, each targeting a real, measured search query (Google Trends US, 12mo) rather than a guessed keyword. Mineral fact and cultural tradition are explicitly separated in every post — see the claim policy above.",
  );
  lines.push("");
  for (const post of [...blogPosts].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))) {
    lines.push(`- [${post.title}](${site.url}/blog/${post.slug}): ${post.excerpt}`);
  }
  lines.push("");

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

  return lines.join("\n") + "\n";
}

export async function GET() {
  const products = await getLiveProducts();
  return new Response(buildLlmsTxt(products), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
