import type { ReactNode } from "react";

import { AccountNav } from "@/components/account/AccountNav";
import { isSignedIn } from "@/lib/shopify/guard";

/**
 * Account shell. Signed-in members get the sticky account nav beside the page
 * content; sign-in/callback stay single-purpose (no nav).
 */
export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return <>{children}</>;
  }

  return (
    <section className="relative min-h-[70vh] overflow-x-clip bg-parchment pt-10 pb-20 md:pt-14 md:pb-28">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        {/* Both tracks are minmax(0,…): a grid item defaults to min-width:auto,
            which lets a wide child (the scrolling nav rail) push the whole
            page sideways on a phone instead of scrolling inside itself. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <aside className="min-w-0 lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
            <AccountNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
