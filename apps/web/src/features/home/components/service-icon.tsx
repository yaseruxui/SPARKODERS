import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { ServiceKey } from '../types';

/**
 * Duotone line icons on a 48px grid: a soft filled shape (`.duo`) under a crisp stroke, with one
 * aqua accent each. Drawn inline so nothing is fetched.
 */
const ICONS: Record<ServiceKey, ReactNode> = {
  website: (
    <>
      <rect className="duo" x="5" y="8" width="38" height="30" rx="5" />
      <rect x="5" y="8" width="38" height="30" rx="5" />
      <path d="M5 16h38" />
      <path className="accent" d="M10.5 12h.01M14.5 12h.01M18.5 12h.01" />
      <path className="accent" d="m19 23-4.5 4 4.5 4M29 23l4.5 4-4.5 4M26 21.5l-4 11" />
      <path d="M17 43h14" />
    </>
  ),
  store: (
    <>
      <path className="duo" d="M11 16h32l-3.6 15.2a3 3 0 0 1-2.9 2.3H17.3a3 3 0 0 1-2.9-2.4Z" />
      <path d="M4 7h4.2a2 2 0 0 1 2 1.6L14.4 31a3 3 0 0 0 2.9 2.5h19.2a3 3 0 0 0 2.9-2.3L43 16H11.3" />
      <circle cx="19" cy="40.5" r="2.5" />
      <circle cx="35" cy="40.5" r="2.5" />
      <path className="accent" d="m22 23.5 3 3 6-6" />
    </>
  ),
  app: (
    <>
      <rect className="duo" x="12" y="4" width="24" height="40" rx="6" />
      <rect x="12" y="4" width="24" height="40" rx="6" />
      <path d="M21 8.5h6M21.5 39h5" />
      <rect className="accent" x="17" y="15" width="6" height="6" rx="1.8" />
      <rect className="accent" x="25" y="15" width="6" height="6" rx="1.8" />
      <rect className="accent" x="17" y="23" width="6" height="6" rx="1.8" />
      <rect x="25" y="23" width="6" height="6" rx="1.8" />
    </>
  ),
  systems: (
    <>
      <rect className="duo" x="5" y="6" width="38" height="36" rx="5" />
      <rect x="5" y="6" width="38" height="36" rx="5" />
      <path d="M17 6v36M17 15h26" />
      <path d="M9.5 11h3M9.5 20h3M9.5 26h3" />
      <path className="accent" d="m22 34 5-6 4 3 7-8" />
    </>
  ),
  branding: (
    <>
      <path
        className="duo"
        d="M24 5C13.5 5 5 13 5 23s8.5 19 18.5 19c2.4 0 3.6-2 2.7-4-1.2-2.6.6-5 3.3-5H35a8 8 0 0 0 8-8C43 13.7 34.5 5 24 5Z"
      />
      <path d="M24 5C13.5 5 5 13 5 23s8.5 19 18.5 19c2.4 0 3.6-2 2.7-4-1.2-2.6.6-5 3.3-5H35a8 8 0 0 0 8-8C43 13.7 34.5 5 24 5Z" />
      <circle className="accent" cx="14.5" cy="22" r="2.6" />
      <circle cx="19.5" cy="13.5" r="2.6" />
      <circle className="accent" cx="29.5" cy="13" r="2.6" />
      <circle cx="35.5" cy="20.5" r="2.6" />
    </>
  ),
  seo: (
    <>
      <circle className="duo" cx="21" cy="21" r="15" />
      <circle cx="21" cy="21" r="15" />
      <path d="m32 32 11 11" />
      <path className="accent" d="m13.5 25.5 5-5 4 4 6.5-7" />
      <path className="accent" d="M25 17.5h4v4" />
    </>
  ),
};

/** A service's duotone icon. Put it inside a `.service-icon` box, which styles its fill and accent. */
export function ServiceIcon({ service, className }: { service: ServiceKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn('size-full overflow-visible drop-shadow-[0_8px_18px_rgb(7_5_26/0.45)]', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[service]}
    </svg>
  );
}
