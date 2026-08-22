import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/providers/CartProvider";
import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import RevealRoot from "@/components/ui/RevealRoot";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time by next/font — no third-party request, no FOUT.
// Same weights as the crawlandcuddle reference build: Sora 400–700 for
// display, Inter 300–700 for body — so the whole page renders the same type.
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const title = `${site.name} — Black Tourmaline Bracelet for Men`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  generator: undefined,
  keywords: [
    "black tourmaline bracelet",
    "mens tourmaline bracelet",
    "square bead bracelet men",
    "schorl bracelet",
    "grounding bracelet for men",
    "elastic stone bracelet",
    "mens beaded bracelet",
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
      className={`${sora.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Gates the scroll-reveal CSS. Without scripting the class is never
            added, so no content can be left stranded at opacity 0. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#showcase"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-volt focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <LocalizationProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </LocalizationProvider>
        <RevealRoot />
      </body>
    </html>
  );
}
