import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutSummary } from "@/components/cart/CheckoutSummary";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your bag and complete your HimVolt order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="relative min-h-[70vh] bg-parchment px-5 pt-16 pb-24 sm:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] text-ink-mute"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-soft">Checkout</span>
        </nav>
        <h1 className="font-display mt-6 text-[clamp(1.9rem,1.4rem+1.8vw,2.75rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink">
          Checkout
        </h1>
        <CheckoutSummary />
      </div>
    </section>
  );
}
