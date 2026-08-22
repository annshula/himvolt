import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { isCustomerAccountConfigured } from "@/lib/shopify/config";
import { isSignedIn } from "@/lib/shopify/guard";

export const metadata: Metadata = {
  title: "Sign in — HimVolt",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Sign-in was cancelled. You can try again whenever you are ready.",
  expired: "That sign-in link expired. Please start again.",
  state_mismatch:
    "We could not verify that sign-in request. Please start again.",
  nonce_mismatch:
    "We could not verify that sign-in request. Please start again.",
  exchange_failed:
    "We could not complete the sign-in. Please try again in a moment.",
  missing_code: "The sign-in response was incomplete. Please try again.",
  unconfigured:
    "Sign-in is not connected to the store yet — please check your Shopify settings.",
  provider: "We could not complete the sign-in. Please try again in a moment.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (await isSignedIn()) redirect("/account");

  const rawError = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = rawError
    ? (ERROR_MESSAGES[rawError] ?? ERROR_MESSAGES.provider)
    : null;

  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
      ? rawReturnTo
      : "/account";

  return (
    <section className="relative bg-parchment px-5 pt-16 pb-24 sm:px-8">
      <div className="mx-auto w-full max-w-md pt-6 text-center">
        <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-accent text-on-accent">
          <Icon name="shield" className="size-7" />
        </span>
        <h1 className="font-display text-[clamp(2rem,1.5rem+2vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink">
          Sign in
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          See your orders, track deliveries and manage your profile. No password
          is stored by this site — sign-in runs through a secure, encrypted flow
          handled by our store provider.
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-(--radius-card) border border-red-200 bg-red-50 px-5 py-4 text-left">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {!isCustomerAccountConfigured() ? (
          <div className="mt-8 rounded-(--radius-card) border border-line bg-ivory px-6 py-8 text-left shadow-sm">
            <p className="font-display text-lg font-bold text-ink">
              Accounts are not connected yet
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Sign-in is not available on this store yet. You can still browse
              and check out as normal.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <Button
              href={`/account/authorize?returnTo=${encodeURIComponent(returnTo)}`}
              arrow
              className="w-full justify-center"
            >
              Continue securely
            </Button>
          </div>
        )}

        <div className="mt-8 flex gap-3 rounded-(--radius-card) border border-line bg-ivory p-4 text-left shadow-sm">
          <Icon name="shield" className="mt-0.5 size-5 shrink-0 text-ink" />
          <p className="text-sm leading-relaxed text-ink-soft">
            Sign-in uses a secure, encrypted flow handled by our payment and
            accounts provider. Your credentials never reach this site.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-ink-mute">
          By continuing you agree to our{" "}
          <Link href="/" className="underline underline-offset-4">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/" className="underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
