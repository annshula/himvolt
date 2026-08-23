import type { Metadata } from "next";
import Link from "next/link";

import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts } from "@/content/blog";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const title = "Blog";
const description =
  "Black tourmaline, men's bracelets and honest buying guides — mineral facts kept separate from tradition, no health claims.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: `${title} · ${site.name}`,
    description,
    url: absoluteUrl("/blog"),
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
  },
};

const posts = [...blogPosts].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

export default function BlogIndexPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-310 px-5 pt-12 pb-2 sm:px-8 sm:pt-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] text-ink-mute"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-soft">Blog</span>
        </nav>

        <h1 className="font-display mt-7 text-[clamp(2rem,1.5rem+2.2vw,3.2rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink">
          The HimVolt Journal
        </h1>
        <p className="mt-3 max-w-[58ch] text-[0.95rem] leading-relaxed text-ink-soft">
          Mineral facts and buying guides for black tourmaline and men's
          beaded bracelets — what is measurable, what is tradition, and what
          we will not claim.
        </p>
      </div>

      <div className="mx-auto w-full max-w-310 px-5 pt-10 pb-24 sm:px-8 lg:pb-32">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
