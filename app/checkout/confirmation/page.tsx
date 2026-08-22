import type { Metadata } from "next";
import Link from "next/link";

import { ClearCart } from "@/components/cart/ClearCart";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Thank you — your HimVolt order is confirmed.",
  robots: { index: false, follow: false },
};

/**
 * Post-payment landing page. Shopify redirects here via the `return_to` param
 * on the checkout URL after a successful payment; ClearCart empties the local
 * bag at that point.
 */
export default function ConfirmationPage() {
  return (
    <section className="relative min-h-[70vh] bg-parchment px-5 pt-16 pb-24 sm:px-8">
      <ClearCart />
      <div className="mx-auto flex w-full max-w-xl flex-col items-center pt-10 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-volt text-white">
          <Icon name="check" className="size-7" />
        </span>
        <h1 className="font-display mt-6 text-[clamp(1.9rem,1.4rem+1.8vw,2.75rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-ink">
          Thank you — order confirmed
        </h1>
        <p className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.65] text-ink-soft text-pretty">
          Your order is in. We&rsquo;ve emailed your receipt, and tracking will
          appear in your account under Orders as soon as your band ships.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href="#top">Continue shopping</Button>
          <Button href="/account/orders" variant="outline">
            View your orders
          </Button>
        </div>
        <p className="mt-10 text-sm text-ink-mute">
          Questions? Email{" "}
          <Link
            href="mailto:care@himvolt.com"
            className="text-ink underline underline-offset-4"
          >
            care@himvolt.com
          </Link>
        </p>
      </div>
    </section>
  );
}
