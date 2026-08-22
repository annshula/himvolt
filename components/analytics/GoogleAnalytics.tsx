"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[][];
  }
}

/** Push an event to the gtag dataLayer (safe before or after the loader loads). */
function track(event: string, params: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", event, params]);
}

/**
 * Fires a GA4 page_view on every client navigation. GA4's automatic page_view
 * is disabled in the loader (send_page_view:false) because it does not observe
 * App Router transitions, so this is what records soft navigations.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    track("page_view", {
      page_path: query ? `${pathname}?${query}` : (pathname ?? "/"),
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Google Tag (gtag.js) — the standard GA4 loader plus a route-change
 * page_view tracker. No-ops when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="himvolt-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
