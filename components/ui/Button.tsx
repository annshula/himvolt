import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowIcon } from "./Icons";

type Variant = "volt" | "invert" | "ghost";

const sizes = {
  md: "h-11 px-5 text-[0.82rem]",
  lg: "h-14 px-8 text-[0.92rem]",
} as const;

/**
 * The black CTA is the loudest element on the page and there is only ever one
 * of it in view at a time. "volt" is a solid black button for light surfaces;
 * "invert" is a solid white button for the dark hero and nav. The shimmer is
 * a single translated pseudo-gradient, so hover costs one composited layer.
 */
export default function Button({
  children,
  variant = "volt",
  size = "lg",
  arrow = false,
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"a"> & {
  children: ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  arrow?: boolean;
}) {
  const shell =
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-display font-semibold uppercase leading-none tracking-[0.14em] whitespace-nowrap transition-all duration-400 ease-[var(--ease-out-expo)] will-change-transform";

  const styles: Record<Variant, string> = {
    volt: "bg-ink text-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:shadow-[0_18px_54px_-12px_rgba(0,0,0,0.7)] active:translate-y-0",
    invert:
      "bg-white text-ink shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_54px_-12px_rgba(0,0,0,0.75)] active:translate-y-0",
    ghost:
      "border border-white/15 text-chalk/85 backdrop-blur-sm hover:border-white/30 hover:bg-white/10 hover:text-white",
  };

  return (
    <a
      className={`${shell} ${sizes[size]} ${styles[variant]} ${className}`}
      {...rest}
    >
      {(variant === "volt" || variant === "invert") && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,${
            variant === "invert" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.42)"
          }_50%,transparent_62%)] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:translate-x-full`}
        />
      )}
      <span className="relative">{children}</span>
      {arrow && (
        <ArrowIcon className="relative h-4 w-4 transition-transform duration-400 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
      )}
    </a>
  );
}
