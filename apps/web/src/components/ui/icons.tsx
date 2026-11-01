import type { SVGProps } from 'react';
import { cn } from '@/utils/cn';

type IconProps = SVGProps<SVGSVGElement>;

const base = 'size-[1.1em] shrink-0';

/**
 * Points toward the reading direction's "forward": left in Arabic, right in English.
 * Shaft and arms are separate so a hovered link or button can open the head (`.learn-arrow`).
 */
export function ArrowIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(base, 'learn-arrow ltr:-scale-x-100', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 12H5" />
      <path className="learn-arm learn-arm-top" d="M11 6 5 12" />
      <path className="learn-arm learn-arm-bottom" d="M5 12l6 6" />
    </svg>
  );
}
