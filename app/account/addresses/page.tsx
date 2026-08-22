import type { Metadata } from "next";

import { AccountHeader } from "@/components/account/AccountHeader";
import { EmptyState } from "@/components/account/EmptyState";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { getCustomer } from "@/lib/shopify/customer-service";
import { requireCustomer } from "@/lib/shopify/guard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Addresses — HimVolt",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  await requireCustomer("/account/addresses");

  const customer = await getCustomer();
  const addresses = customer.addresses;
  const defaultId = customer.defaultAddressId;

  return (
    <div className="min-w-0">
      <AccountHeader
        title="Addresses"
        body="Saved delivery and billing addresses on your account."
        crumbs={[{ label: "Addresses" }]}
      />

      {addresses.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon="map-pin"
            title="No addresses yet"
            body="Your saved delivery addresses will appear here once you add one at checkout."
          >
            <Button href="/products/the-tourmaline-band" arrow className="w-full sm:w-auto">
              Shop the collection
            </Button>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
          {addresses.map((address) => {
            const isDefault = address.id === defaultId;
            const name =
              [address.firstName, address.lastName].filter(Boolean).join(" ") ||
              "This address";
            const lines =
              address.formatted.length > 0
                ? address.formatted
                : [address.address1, address.address2, address.city].filter(
                    (v): v is string => Boolean(v),
                  );

            return (
              <li
                key={address.id}
                className={cn(
                  "relative flex min-w-0 flex-col overflow-hidden rounded-(--radius-card) border bg-ivory shadow-sm transition-shadow duration-500 ease-(--ease-out-expo) hover:shadow-(--shadow-lift)",
                  isDefault ? "border-ink/40" : "border-line",
                )}
              >
                {/* Tinted band with the pin sitting on the seam. */}
                <div className="relative h-16 bg-parchment">
                  {isDefault && (
                    <span className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.16em] text-ink uppercase shadow-sm backdrop-blur-sm">
                      <Icon name="check" className="size-3" strokeWidth={2.4} />
                      Default
                    </span>
                  )}
                  <span className="absolute bottom-0 left-5 grid size-11 translate-y-1/2 place-items-center rounded-full border-[3px] border-ivory bg-ink text-white">
                    <Icon name="map-pin" className="size-4" />
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col px-5 pt-9 pb-5 sm:px-6 sm:pb-6">
                  <p className="font-display text-lg font-semibold wrap-break-word text-ink">
                    {name}
                  </p>

                  {lines.length > 0 ? (
                    <address className="mt-2 flex flex-col not-italic">
                      {lines.map((line, li) => (
                        <span
                          key={li}
                          className="text-sm wrap-break-word text-ink-soft"
                        >
                          {line}
                        </span>
                      ))}
                    </address>
                  ) : (
                    <p className="mt-2 text-sm text-ink-mute">
                      No full address on file
                    </p>
                  )}

                  {address.phoneNumber && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-ink-mute">
                      <Icon name="globe" className="size-3.5 shrink-0" />
                      <span className="wrap-break-word">
                        {address.phoneNumber}
                      </span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
