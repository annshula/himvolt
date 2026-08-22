import Link from "next/link";
import { site } from "@/lib/site";

/**
 * The mark is the product and the name in one shape: a square-cut bead with a
 * bolt struck through it as negative space. It inherits the current text
 * colour, so it is black on light surfaces and white on the dark hero/nav.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d="M8.4 2h15.2A6.4 6.4 0 0 1 30 8.4v15.2a6.4 6.4 0 0 1-6.4 6.4H8.4A6.4 6.4 0 0 1 2 23.6V8.4A6.4 6.4 0 0 1 8.4 2Zm9.1 4.6-8.7 11.1a.7.7 0 0 0 .55 1.13h4.32l-1.5 7.02a.7.7 0 0 0 1.24.56l8.86-11.2a.7.7 0 0 0-.55-1.13h-4.4l1.44-6.9a.7.7 0 0 0-1.26-.58Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-[1.05rem] tracking-[-0.04em] ${className}`}
    >
      HimVolt
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`group flex items-center gap-2.5 ${className}`}
    >
      <LogoMark className="h-7 w-7 transition-transform duration-500 ease-spring group-hover:scale-110" />
      <Wordmark />
    </Link>
  );
}
