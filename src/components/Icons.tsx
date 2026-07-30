/*
 * Icon rules: 1px hairline strokes, 20–22px box, squared terminals, no fills,
 * no duotone. Colour comes from the parent via currentColor. Never scale above
 * 24px.
 */

interface IconProps {
  size?: number;
}

const base = {
  viewBox: '0 0 22 22',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
} as const;

export function ChatIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <path d="M2.5 4.5h17v12h-11l-6 4.5v-4.5z" />
    </svg>
  );
}

export function MenuIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <path d="M2.5 6h17M2.5 11h17M2.5 16h17" />
    </svg>
  );
}

export function FeedIcon({ size = 21 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <rect x="2.5" y="2.5" width="17" height="17" />
      <path d="M2.5 8.5h17" />
    </svg>
  );
}

export function CommunityIcon({ size = 21 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <circle cx="8" cy="8" r="4" />
      <path d="M2 19c1-3.2 3.2-4.6 6-4.6S13 15.8 14 19M14.5 5.2a4 4 0 010 5.6M17 4a6.5 6.5 0 010 8" />
    </svg>
  );
}

export function PlusIcon({ size = 15 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path d="M8 1v14M1 8h14" />
    </svg>
  );
}

export function CanteenIcon({ size = 21 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <path d="M4 2.5v7a2.5 2.5 0 005 0v-7M6.5 9.5V19.5M14 19.5V12M14 12c-1.5 0-2.5-1-2.5-3.5S12.5 2.5 14 2.5s2.5 3.5 2.5 6S15.5 12 14 12z" />
    </svg>
  );
}

export function ProfileIcon({ size = 21 }: IconProps) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <circle cx="11" cy="8" r="3.5" />
      <path d="M4 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}
