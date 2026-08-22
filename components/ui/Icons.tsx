import type { SVGProps } from "react";

type IconProps = { className?: string };

const base = "h-full w-full";

export function StoneIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2.6 20.2 7v10L12 21.4 3.8 17V7L12 2.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.6 12 12m0 0 8.2-5M12 12l-8.2-5M12 12v9.4"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity=".45"
      />
    </svg>
  );
}

export function FitIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse
        cx="12"
        cy="12"
        rx="8.6"
        ry="6.2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M2 12h2.6M19.4 12H22"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M5.4 9.4 3.4 12l2 2.6M18.6 9.4l2 2.6-2 2.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShipIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.2 7.6 12 3l8.8 4.6v8.8L12 21l-8.8-4.6V7.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 7.7 12 12.2l8.6-4.5M12 12.2V21"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 5.2 16.4 9.8"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity=".45"
      />
    </svg>
  );
}

export function StarIcon({
  className = base,
  filled = true,
}: IconProps & { filled?: boolean }) {
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
      <path
        d="m4.8 12.6 4.4 4.4L19.4 6.8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 12h13.5M13 6.5 18.8 12 13 17.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlobeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3.2 9.6h17.6M3.2 14.4h17.6"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity=".6"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="4.1"
        ry="9"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity=".6"
      />
    </svg>
  );
}

export function ReturnIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 12a8 8 0 1 1 2.6 5.9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M3.4 7.2v4.6H8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Account / cart / status icons ─────────────────────────────────────── */

export function BagIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5.5 8.5h13l-1 11a1.6 1.6 0 0 1-1.6 1.5H8.1A1.6 1.6 0 0 1 6.5 19.5l-1-11Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9 10V6.8a3 3 0 0 1 6 0V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrashIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 7h15M9 7V4.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V7M6.4 7l.7 12.2a1.7 1.7 0 0 0 1.7 1.6h6.4a1.7 1.7 0 0 0 1.7-1.6L17.6 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MinusIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UserIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4.5 20c.7-3.6 3.5-5.4 7.5-5.4s6.8 1.8 7.5 5.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RefreshIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20 12a8 8 0 1 1-2.3-5.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 3.4V8h-4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlertIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.5 21 19.5H3L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4.5M12 16.6v.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PackageIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.5 7.4 12 3l8.5 4.4v9.2L12 21l-8.5-4.4V7.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M3.6 7.5 12 12l8.4-4.5M12 12v9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TruckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 6h11v10h-11z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 9h4l3 3v4h-7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle
        cx="6.5"
        cy="17.5"
        r="1.8"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle
        cx="17"
        cy="17.5"
        r="1.8"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function MapPinIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12 2.2 2.2 4.4-4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GiftIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 10.5h16v10H4v-10ZM3 6.5h18v4H3v-4ZM12 6.5v14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.5S9 6 7.6 4.8a1.6 1.6 0 0 1 2.3-2.3C11.4 4 12 6.5 12 6.5Zm0 0s3-.5 4.4-1.7a1.6 1.6 0 0 0-2.3-2.3C12.6 4 12 6.5 12 6.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpinnerIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoutIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12h11M17.5 8.5 21 12l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeatherIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20 4c-6 0-12 3-14.5 9.5L4 20l6.5-1.5C17 16 21 10 20 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c1.5-3 4-5.5 7.5-7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const featureIcons = {
  stone: StoneIcon,
  fit: FitIcon,
  ship: ShipIcon,
} as const;

/* ── Name-based Icon component (account / cart) ────────────────────────── */

export const iconMap = {
  stone: StoneIcon,
  fit: FitIcon,
  ship: ShipIcon,
  star: StarIcon,
  check: CheckIcon,
  "arrow-right": ArrowIcon,
  globe: GlobeIcon,
  return: ReturnIcon,
  bag: BagIcon,
  close: CloseIcon,
  trash: TrashIcon,
  minus: MinusIcon,
  plus: PlusIcon,
  user: UserIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-right": ChevronRightIcon,
  refresh: RefreshIcon,
  alert: AlertIcon,
  package: PackageIcon,
  truck: TruckIcon,
  "map-pin": MapPinIcon,
  shield: ShieldIcon,
  gift: GiftIcon,
  spinner: SpinnerIcon,
  logout: LogoutIcon,
  feather: FeatherIcon,
} as const;

export type IconName = keyof typeof iconMap;

export function Icon({
  name,
  className,
  strokeWidth,
  ...rest
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "className">) {
  const Cmp = iconMap[name];
  const props = { className, ...rest } as SVGProps<SVGSVGElement>;
  if (strokeWidth !== undefined) {
    props.strokeWidth = strokeWidth;
  }
  return <Cmp {...props} />;
}
