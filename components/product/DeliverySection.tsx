import Link from "next/link";

import { Icon } from "@/components/ui/Icons";
import { site } from "@/lib/site";

/**
 * The delivery block under the accordion — the reference's three reassurance
 * lines (tracked delivery, secure checkout, put-it-right policy), each with
 * its policy link. The day range is `site.delivery`, one value for the whole
 * product page.
 */
export function DeliverySection() {
  return (
    <ul
      aria-label="Delivery"
      className="mt-6 space-y-3.5 rounded-card bg-cream/80 p-5 text-body-sm md:p-6"
    >
      <li className="flex gap-3">
        <Icon name="truck" className="size-5 shrink-0" />
        <span>
          Tracked delivery in {site.delivery.minDays}–{site.delivery.maxDays}{" "}
          days.{" "}
          <Link href="/shipping-policy" className="link-underline">
            Shipping details
          </Link>
        </span>
      </li>
      <li className="flex gap-3">
        <Icon name="shield" className="size-5 shrink-0" />
        <span>Secure checkout by Shopify.</span>
      </li>
      <li className="flex gap-3">
        <Icon name="refresh" className="size-5 shrink-0" />
        <span>
          Damaged, missing or wrong item? We&apos;ll put it right.{" "}
          <Link href="/refund-policy" className="link-underline">
            Refund policy
          </Link>
        </span>
      </li>
    </ul>
  );
}
