import type { Metadata } from "next";
import Link from "next/link";

import { AccountHeader } from "@/components/account/AccountHeader";
import { EmptyState } from "@/components/account/EmptyState";
import { OrderRow } from "@/components/account/OrderRow";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { listOrders } from "@/lib/shopify/customer-service";
import { requireCustomer } from "@/lib/shopify/guard";

export const metadata: Metadata = {
  title: "Order history — HimVolt",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ after?: string | string[] }>;
};

export default async function OrdersPage({ searchParams }: PageProps) {
  await requireCustomer("/account/orders");
  const params = await searchParams;
  const after = Array.isArray(params.after) ? params.after[0] : params.after;

  const { orders, hasNextPage, endCursor } = await listOrders({
    first: 10,
    after: after ?? null,
  });

  return (
    <div className="min-w-0">
      <AccountHeader
        title="Order history"
        body="Every order you have placed, with live fulfilment and delivery tracking."
        crumbs={[{ label: "Orders" }]}
      />

      {orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon="bag"
            title="Nothing here yet"
            body="Your orders will appear here as soon as you place one."
          >
            <Button href="/shop" arrow className="w-full sm:w-auto">
              Shop the collection
            </Button>
          </EmptyState>
        </div>
      ) : (
        <>
          <ul className="mt-10 flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderRow order={order} />
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
            {after ? (
              <Link
                href="/account/orders"
                className="group/link flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.2em] text-ink uppercase"
              >
                <Icon
                  name="arrow-right"
                  className="size-3.5 rotate-180 transition-transform duration-500 ease-(--ease-out-expo) group-hover/link:-translate-x-1"
                />
                Most recent
              </Link>
            ) : (
              <span />
            )}
            {hasNextPage && endCursor ? (
              <Link
                href={`/account/orders?after=${encodeURIComponent(endCursor)}`}
                className="group/link flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.2em] text-ink uppercase"
              >
                Older orders
                <Icon
                  name="arrow-right"
                  className="size-3.5 transition-transform duration-500 ease-(--ease-out-expo) group-hover/link:translate-x-1"
                />
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
