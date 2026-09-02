import Image from "@/components/ui/Image";
import Link from "next/link";
import { site } from "@/lib/site";

export type LogoVariant = "black" | "white";

const LOGO_SRC: Record<LogoVariant, string> = {
  black: "/logo-black.webp",
  white: "/logo-white.webp",
};

/**
 * The brand mark rendered from the logo masters in assets/brand (→
 * public/logo-{black,white}.webp). Pick the variant that reads on the
 * surface it sits on — black on light, white on dark.
 */
export function LogoMark({
  variant = "black",
  priority = false,
  className = "h-8 w-8",
}: {
  variant?: LogoVariant;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_SRC[variant]}
      alt={site.name}
      // Rendered at 28-32px everywhere it's used (see Nav.tsx, Footer.tsx) —
      // 128 covers up to 4x DPR with room to spare, without next/image
      // computing a srcset toward the mark's actual 512x512 source file.
      width={128}
      height={128}
      priority={priority}
      className={className}
    />
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

export function Logo({
  variant = "black",
  priority = false,
  className = "",
}: {
  variant?: LogoVariant;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`group flex items-center gap-2.5 ${className}`}
    >
      <LogoMark
        variant={variant}
        priority={priority}
        className="h-7 w-7 transition-transform duration-500 ease-spring group-hover:scale-110"
      />
      <Wordmark />
    </Link>
  );
}
