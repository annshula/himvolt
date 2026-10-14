import type { Metadata } from "next";

import { BagContents } from "@/components/cart/BagContents";
import { getPaymentMethods } from "@/lib/shopify/payments";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review your bag and complete your HimVolt order.",
  robots: { index: false, follow: false },
};

/** Full-page bag — the same bag as the drawer, as a no-JS-friendly page. */
export default async function CheckoutPage() {
  const payments = await getPaymentMethods();
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-10 pb-24 sm:px-8">
      <h1 className="text-center font-serif text-heading-lg font-light lg:text-left">
        Your bag
      </h1>
      <div className="mt-8 flex min-h-80 flex-col rounded-media bg-cream p-2">
        <BagContents payments={payments} />
      </div>
    </div>
  );
}
