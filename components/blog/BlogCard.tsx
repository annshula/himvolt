import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Motion";
import type { BlogPost } from "@/content/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Reveal as="article">
      <Link
        href={`/blog/${post.slug}`}
        className="group block overflow-hidden rounded-(--radius-card) border border-line bg-linen transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-ink/15 hover:shadow-(--shadow-e3)"
      >
        <div className="relative aspect-[3/2] overflow-hidden bg-parchment">
          <Image
            src={post.coverImage.src}
            alt={post.coverImage.alt}
            fill
            sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 380px"
            className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-105"
          />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-[0.66rem] tracking-[0.1em] text-ink-mute uppercase">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h2 className="font-display mt-2.5 text-[1.05rem] leading-tight font-bold tracking-[-0.02em] text-ink">
            {post.title}
          </h2>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>

          <span className="mt-4 inline-flex items-center gap-1 text-[0.66rem] font-semibold tracking-[0.08em] text-volt uppercase">
            Read
            <ArrowIcon className="h-3 w-3 transition-transform duration-400 ease-(--ease-out-expo) group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
