import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Jost, Oswald } from "next/font/google";
import { ClarityAnalytics } from "@/components/analytics/ClarityAnalytics";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/providers/CartProvider";
import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import { Toaster } from "sonner";
import Footer from "@/components/sections/Footer";
import Nav from "@/components/sections/Nav";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time by next/font — no third-party request, no FOUT.
// Font-pairing structure mirrors the crawlandcuddle reference build (a
// condensed display face + a bold headline face + a wide-tracked label
// face + a body sans), re-cast in a masculine register for a hematite
// bracelet and ring collection instead of the reference's nursery voice:
//   Bebas Neue -> font-mega     (the single largest hero statement)
//   Oswald     -> font-display  (headings, buttons, uppercase chrome)
//   Jost       -> font-label    (wide-tracked eyebrows + nav)
//   Inter      -> font-sans     (body copy, unchanged)
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
  preload: false,
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
  preload: true,
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/** Google Tag Manager container — loaded high in <head>, noscript after <body>. */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const title = `${site.name} — Genuine Hematite Bracelets & Rings for Men`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  generator: undefined,
  // Curated against Google Trends US search interest (12mo, related_queries
  // + compare_terms on "hematite bracelet" / "hematite ring"): kept the
  // terms with real, non-zero measured volume and dropped the rest —
  // notably excluding "hemios"/"hematix"/"hemys", which are competitor
  // brand names showing up as related queries, not generic search demand.
  keywords: [
    "hematite bracelet",
    "hematite stone bracelet",
    "hematite crystal bracelet",
    "hematite bracelet benefits",
    "natural hematite bracelet",
    "hematite ring",
    "hematite ring meaning",
    "magnetic hematite bracelet",
    "HimVolt",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    creator: "@himvolt",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${oswald.variable} ${jost.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Tag Manager — loaded as early as possible so container tags
            (GA4, remarketing, …) fire before the first interaction. */}
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) — tracking fallback when JS is off. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <a
          href="#showcase"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-volt focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <LocalizationProvider>
          <CartProvider>
            <Nav />
            {children}
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LocalizationProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex items-center gap-3 rounded-full bg-ink px-5 py-3 shadow-(--shadow-lift)",
              icon: "m-0 shrink-0",
              title: "text-[0.82rem] font-medium text-white",
              description: "text-[0.78rem] text-white/60",
            },
          }}
        />
        <ClarityAnalytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
