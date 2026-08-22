import type { ReactNode } from "react";
import { ArrowIcon } from "./Icons";

type Variant = "volt" | "invert" | "ghost" | "outline";

const base = {
  md: "h-11 text-[0.82rem]",
  lg: "h-14 text-[0.92rem]",
} as const;

/**
 * Arrow buttons keep symmetric padding so the label sits on the true button
 * center. The arrow variant grows both paddings by half the icon footprint
 * (1rem icon + 0.625rem gap = 1.625rem), preserving the original pill width
 * while reserving room for the icon, which is pinned to the right edge.
 */
const pad = {
  md: { plain: "px-5", arrow: "px-[2.0625rem]" },
  lg: { plain: "px-8", arrow: "px-[2.8125rem]" },
} as const;

const iconPos = {
  md: "right-3",
  lg: "right-4",
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
  withArrow = false,
  href,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  title,
  "aria-label": ariaLabel,
  target,
  rel,
}: {
  children: ReactNode;
  variant?: Variant;
  size?: keyof typeof base;
  arrow?: boolean;
  /** Alias for `arrow` (reference parity). */
  withArrow?: boolean;
  /** When present, renders an anchor; otherwise a button. */
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  title?: string;
  "aria-label"?: string;
  target?: string;
  rel?: string;
}) {
  const shell =
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-display font-semibold uppercase leading-none tracking-[0.14em] whitespace-nowrap transition-all duration-400 ease-[var(--ease-out-expo)] will-change-transform";

  const styles: Record<Variant, string> = {
    volt: "bg-ink text-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:shadow-[0_18px_54px_-12px_rgba(0,0,0,0.7)] active:translate-y-0",
    invert:
      "bg-white text-ink shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_54px_-12px_rgba(0,0,0,0.75)] active:translate-y-0",
    ghost:
      "border border-white/15 text-chalk/85 backdrop-blur-sm hover:border-white/30 hover:bg-white/10 hover:text-white",
    outline:
      "border border-ink/25 bg-transparent text-ink hover:border-ink/60 hover:bg-ink/[0.03]",
  };

  const showArrow = arrow || withArrow;

  const classes = `${shell} ${base[size]} ${
    showArrow ? pad[size].arrow : pad[size].plain
  } ${styles[variant]} ${className}${
    disabled ? " pointer-events-none opacity-50" : ""
  }`;

  const content = (
    <>
      {(variant === "volt" || variant === "invert") && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,${
            variant === "invert" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.42)"
          }_50%,transparent_62%)] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:translate-x-full`}
        />
      )}
      <span className="relative">{children}</span>
      {showArrow && (
        <ArrowIcon
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 ${iconPos[size]} transition-transform duration-400 ease-[var(--ease-out-expo)] group-hover:translate-x-1`}
        />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        title={title}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={classes}
    >
      {content}
    </button>
  );
}
