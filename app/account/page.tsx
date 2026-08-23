import type { Metadata } from "next";
import Link from "next/link";

import { AccountHeader } from "@/components/account/AccountHeader";
import { EmptyState } from "@/components/account/EmptyState";
import { OrderRow } from "@/components/account/OrderRow";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { productPath } from "@/lib/catalog";
import { getCustomer, listOrders } from "@/lib/shopify/customer-service";
import { requireCustomer } from "@/lib/shopify/guard";

export const metadata: Metadata = {
  title: "Your account — HimVolt",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  await requireCustomer("/account");

  // One failing panel must never blank the dashboard.
  const [customerResult, ordersResult] = await Promise.allSettled([
    getCustomer(),
    listOrders({ first: 5 }),
  ]);

  const customer =
    customerResult.status === "fulfilled" ? customerResult.value : null;
  const orders =
    ordersResult.status === "fulfilled" ? ordersResult.value : null;
  const first = customer?.firstName ?? "there";
  const initials =
    (customer?.firstName?.[0] ?? "") + (customer?.lastName?.[0] ?? "");
  const defaultAddress = customer?.defaultAddressId
    ? customer.addresses.find((a) => a.id === customer.defaultAddressId)
    : null;

  return (
    <div className="min-w-0">
      <AccountHeader
        eyebrow="Welcome back"
        title={`Hi, ${first}`}
        body="Your profile, your saved address and everything you have ordered — all in one place."
      />

      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2">
        {/* Profile */}
        <div className="min-w-0 rounded-(--radius-card) border border-line bg-ivory p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="font-display text-base font-bold text-ink uppercase">
              Profile
            </h2>
            <Link
              href="/account/profile"
              className="group/link flex shrink-0 items-center gap-1 text-[0.7rem] font-semibold tracking-[0.14em] text-ink uppercase"
            >
              Edit
              <Icon
                name="arrow-right"
                className="size-3.5 transition-transform duration-500 ease-(--ease-out-expo) group-hover/link:translate-x-1"
              />
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-4 sm:mt-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-parchment font-display text-xl font-bold text-ink uppercase sm:size-14">
              {initials || <Icon name="user" className="size-5" />}
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold wrap-break-word text-ink">
                {[customer?.firstName, customer?.lastName]
                  .filter(Boolean)
                  .join(" ") || "Your name"}
              </p>
              <p className="text-sm wrap-break-word text-ink-soft">
                {customer?.emailAddress ?? "No email on file"}
              </p>
            </div>
          </div>
        </div>

        {/* Default address */}
        <div className="min-w-0 rounded-(--radius-card) border border-line bg-ivory p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="font-display text-base font-bold text-ink uppercase">
              Default address
            </h2>
            <Link
              href="/account/addresses"
              className="group/link flex shrink-0 items-center gap-1 text-[0.7rem] font-semibold tracking-[0.14em] text-ink uppercase"
            >
              All
              <Icon
                name="arrow-right"
                className="size-3.5 transition-transform duration-500 ease-(--ease-out-expo) group-hover/link:translate-x-1"
              />
            </Link>
          </div>
          <div className="mt-5 flex items-start gap-4 sm:mt-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-parchment text-ink sm:size-14">
              <Icon name="map-pin" className="size-5" />
            </span>
            {defaultAddress ? (
              <address className="flex min-w-0 flex-col not-italic">
                {defaultAddress.formatted.map((line, i) => (
                  <span
                    key={i}
                    className="text-sm wrap-break-word text-ink-soft"
                  >
                    {line}
                  </span>
                ))}
              </address>
            ) : (
              <p className="text-sm text-ink-mute">
                No saved address yet — it will appear here once you add one at
                checkout.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-8 sm:mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 className="font-display text-base font-bold text-ink uppercase">
            Recent orders
          </h2>
          <Link
            href="/account/orders"
            className="group/link flex shrink-0 items-center gap-1 text-[0.7rem] font-semibold tracking-[0.14em] text-ink uppercase"
          >
            All orders
            <Icon
              name="arrow-right"
              className="size-3.5 transition-transform duration-500 ease-(--ease-out-expo) group-hover/link:translate-x-1"
            />
          </Link>
        </div>

        {orders && orders.orders.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-3">
            {orders.orders.map((order) => (
              <li key={order.id}>
                <OrderRow order={order} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon="bag"
              title="Nothing here yet"
              body="Your orders will appear here as soon as you place one."
            >
              <Button href={productPath} arrow className="w-full sm:w-auto">
                Shop the collection
              </Button>
            </EmptyState>
          </div>
        )}
      </div>
    </div>
  );
}
