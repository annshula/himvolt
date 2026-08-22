"use client";

import { useActionState } from "react";

import {
  updateProfileAction,
  type ProfileState,
} from "@/app/account/profile/actions";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const initialState: ProfileState = { ok: true };

const inputClass =
  "w-full rounded-full border border-line bg-parchment px-4 py-3 text-sm text-ink transition-colors duration-300 placeholder:text-ink-mute hover:border-ink/30 focus:border-ink focus:outline-none";

const labelClass =
  "text-[0.7rem] font-semibold tracking-[0.14em] text-ink-soft uppercase";

export function ProfileForm({
  firstName,
  lastName,
}: {
  firstName: string | null;
  lastName: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  /* The saved value wins over the prop once an update succeeds. The inputs are
     uncontrolled, so React will not push a new defaultValue into a mounted
     field — keying them on what was actually saved remounts the pair and drops
     the pre-save value the browser was still showing. */
  const savedFirst =
    state.ok && state.firstName !== undefined
      ? state.firstName
      : (firstName ?? "");
  const savedLast =
    state.ok && state.lastName !== undefined
      ? state.lastName
      : (lastName ?? "");

  return (
    <form
      action={formAction}
      className="rounded-(--radius-card) border border-line bg-ivory p-6 shadow-sm"
    >
      <h2 className="font-display text-lg font-bold text-ink uppercase">
        Your details
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        The name used on your orders and deliveries.
      </p>

      <div
        key={`${savedFirst}${savedLast}`}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-2">
          <span className={labelClass}>First name</span>
          <input
            type="text"
            name="firstName"
            defaultValue={savedFirst}
            placeholder="First name"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Last name</span>
          <input
            type="text"
            name="lastName"
            defaultValue={savedLast}
            placeholder="Last name"
            className={inputClass}
          />
        </label>
      </div>

      {state.message && (
        <p
          className={cn(
            "mt-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm",
            state.ok
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700",
          )}
        >
          <Icon
            name={state.ok ? "check" : "close"}
            className="mt-0.5 size-4 shrink-0"
            strokeWidth={2.2}
          />
          {state.message}
        </p>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
