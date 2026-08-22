import type { Metadata } from "next";

import { AccountHeader } from "@/components/account/AccountHeader";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Icon } from "@/components/ui/Icons";
import { getCustomer } from "@/lib/shopify/customer-service";
import { requireCustomer } from "@/lib/shopify/guard";

export const metadata: Metadata = {
  title: "Your profile — HimVolt",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await requireCustomer("/account/profile");
  const customer = await getCustomer();

  return (
    <div className="min-w-0">
      <AccountHeader
        title="Profile"
        body="How we address you on orders, deliveries and every note in between."
        crumbs={[{ label: "Profile" }]}
      />

      <div className="mt-10 grid gap-6 lg:max-w-2xl">
        <ProfileForm
          firstName={customer.firstName}
          lastName={customer.lastName}
        />

        <div className="rounded-[var(--radius-card)] border border-line bg-ivory p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-ink uppercase">
            Contact details
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Managed by your secure customer account.
          </p>

          <dl className="mt-6 flex flex-col divide-y divide-line text-sm">
            <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <dt className="flex items-center gap-2.5 text-ink-soft">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-parchment text-ink">
                  <Icon name="user" className="size-4" />
                </span>
                Email
              </dt>
              <dd className="min-w-0 truncate font-medium text-ink">
                {customer.emailAddress ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
              <dt className="flex items-center gap-2.5 text-ink-soft">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-parchment text-ink">
                  <Icon name="globe" className="size-4" />
                </span>
                Phone
              </dt>
              <dd className="min-w-0 truncate font-medium text-ink">
                {customer.phoneNumber ?? "—"}
              </dd>
            </div>
          </dl>

          <p className="mt-5 flex gap-2.5 rounded-xl bg-parchment px-4 py-3 text-xs text-ink-mute">
            <Icon name="shield" className="mt-0.5 size-4 shrink-0 text-ink" />
            Email and phone change through a verified flow handled by our
            accounts provider.
          </p>
        </div>
      </div>
    </div>
  );
}
