import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogPostingSchema from "@/components/blog/BlogPostingSchema";
import { BlogCard } from "@/components/blog/BlogCard";
import { Reveal } from "@/components/ui/Motion";
import { blogAuthor, blogPosts, getBlogPost } from "@/content/blog";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: "Post not found", robots: { index: false, follow: false } };
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = absoluteUrl(post.coverImage.src);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: [post.targetKeyword, ...post.tags],
    openGraph: {
      type: "article",
      title: `${post.title} · ${site.name}`,
      description: post.excerpt,
      url,
      siteName: site.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [blogAuthor],
      images: [
        {
          url: image,
          width: post.coverImage.width,
          height: post.coverImage.height,
          alt: post.coverImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} · ${site.name}`,
      description: post.excerpt,
      images: [image],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main>
      <BlogPostingSchema post={post} />

      <article className="mx-auto w-full max-w-184 px-5 pt-12 pb-20 sm:px-8 sm:pt-16 lg:pb-28">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] text-ink-mute"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="transition-colors hover:text-ink">
            Blog
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-soft">{post.title}</span>
        </nav>

        <header className="mt-7">
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-2.5 py-1 text-[0.62rem] font-semibold tracking-widest text-ink-mute uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          <Reveal
            as="h1"
            delay={0.06}
            className="font-display mt-4 text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] leading-[1.04] font-extrabold tracking-[-0.04em] text-ink text-balance"
          >
            {post.title}
          </Reveal>

          <div className="mt-5 flex items-center gap-2 text-[0.76rem] text-ink-mute">
            <span>{blogAuthor}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </header>

        <div className="relative mt-8 aspect-3/2 overflow-hidden rounded-(--radius-card) bg-parchment">
          <Image
            src={post.coverImage.src}
            alt={post.coverImage.alt}
            fill
            priority
            sizes="(max-width: 1023px) 92vw, 736px"
            className="object-cover"
          />
        </div>

        <div
          className="prose-himvolt mt-10 max-w-none text-[1rem] leading-[1.75] text-ink-soft [&_a]:text-volt [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-display [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[1.3rem] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_li]:mt-1.5 [&_p]:mt-4 [&_strong]:text-ink [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
          // Author-controlled HTML, same trust model as lib/product.ts's descriptionHtml — never user input.
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        <div className="mt-12 rounded-(--radius-card) border border-line bg-parchment p-7 text-center">
          <p className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
            {site.promise.shipping} · {site.promise.returns}
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 font-display text-[0.8rem] font-semibold tracking-widest text-white uppercase transition-colors duration-300 hover:bg-ink/85"
          >
            Shop the collection
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <div className="mx-auto w-full max-w-310 border-t border-line px-5 pt-14 pb-24 sm:px-8 lg:pb-32">
          <h2 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-ink-mute uppercase">
            More from the journal
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
