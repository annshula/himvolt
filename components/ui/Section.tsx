import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      data-reveal
      className="mb-5 flex items-center gap-3 text-[0.63rem] font-medium tracking-[0.28em] text-volt uppercase"
    >
      <span aria-hidden className="h-px w-7 bg-volt/45" />
      {children}
    </p>
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
      className={`${centered ? "mx-auto max-w-[46rem] text-center" : "max-w-[42rem]"} ${className}`}
    >
      <div className={centered ? "flex justify-center" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2
        data-reveal
        data-reveal-delay="1"
        className="font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.04em] text-balance"
      >
        {title}
      </h2>
      {body && (
        <p
          data-reveal
          data-reveal-delay="2"
          className="mt-6 text-[1rem] leading-[1.7] text-ink-soft text-pretty"
        >
          {body}
        </p>
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
      <div className="mx-auto w-full max-w-[1240px]">{children}</div>
    </section>
  );
}
