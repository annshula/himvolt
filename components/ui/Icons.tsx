type IconProps = { className?: string };

const base = "h-full w-full";

export function StoneIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2.6 20.2 7v10L12 21.4 3.8 17V7L12 2.6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12 2.6 12 12m0 0 8.2-5M12 12l-8.2-5M12 12v9.4" stroke="currentColor" strokeWidth="1.1" opacity=".45" />
    </svg>
  );
}

export function FitIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse cx="12" cy="12" rx="8.6" ry="6.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 12h2.6M19.4 12H22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5.4 9.4 3.4 12l2 2.6M18.6 9.4l2 2.6-2 2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShipIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3.2 7.6 12 3l8.8 4.6v8.8L12 21l-8.8-4.6V7.6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3.4 7.7 12 12.2l8.6-4.5M12 12.2V21" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7.6 5.2 16.4 9.8" stroke="currentColor" strokeWidth="1.1" opacity=".45" />
    </svg>
  );
}

export function StarIcon({ className = base, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="m12 2.8 2.83 5.99 6.42.95-4.65 4.66 1.1 6.61L12 17.87 6.3 21.01l1.1-6.61L2.75 9.74l6.42-.95L12 2.8Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.3}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m4.8 12.6 4.4 4.4L19.4 6.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 12h13.5M13 6.5 18.8 12 13 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.2 9.6h17.6M3.2 14.4h17.6" stroke="currentColor" strokeWidth="1.1" opacity=".6" />
      <ellipse cx="12" cy="12" rx="4.1" ry="9" stroke="currentColor" strokeWidth="1.1" opacity=".6" />
    </svg>
  );
}

export function ReturnIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 12a8 8 0 1 1 2.6 5.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3.4 7.2v4.6H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const featureIcons = {
  stone: StoneIcon,
  fit: FitIcon,
  ship: ShipIcon,
} as const;
