import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { getLegalPage } from "@/content/legal";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const SLUG = "accessibility";

export function generateMetadata(): Metadata {
  const page = getLegalPage(SLUG);
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      type: "website",
      title: `${page.title} · ${site.name}`,
      description: page.description,
      url: absoluteUrl(`/${SLUG}`),
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} · ${site.name}`,
      description: page.description,
    },
  };
}

export default function AccessibilityPage() {
  return <LegalPage slug={SLUG} />;
}
