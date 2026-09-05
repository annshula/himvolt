import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Motion";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Reveal
      as="p"
      className="font-label mb-5 flex items-center gap-3 text-[0.63rem] font-medium tracking-[0.28em] text-volt uppercase"
    >
      <span aria-hidden className="h-px w-7 bg-volt/45" />
      {children}
    </Reveal>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  body?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <header
      className={`${centered ? "mx-auto max-w-184 text-center" : "max-w-2xl"} ${className}`}
    >
      <div className={centered ? "flex justify-center" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <Reveal
        as="h2"
        delay={0.06}
        className="font-display text-[clamp(1.9rem,4.2vw,3.1rem)] leading-[1.06] font-semibold tracking-[-0.02em] text-balance"
      >
        {title}
      </Reveal>
      {body && (
        <Reveal
          as="p"
          delay={0.14}
          className="mt-6 text-[1rem] leading-[1.7] text-ink-soft text-pretty"
        >
          {body}
        </Reveal>
      )}
    </header>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative px-5 py-24 sm:px-8 lg:py-32 ${className}`}
    >
      <div className="mx-auto w-full max-w-310">{children}</div>
    </section>
  );
}
