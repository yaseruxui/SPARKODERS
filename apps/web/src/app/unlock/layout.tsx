import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/lib/config/site';
import { fontVariables } from '@/lib/fonts';
import { cn } from '@/utils/cn';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SPARKODERS',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: 'dark',
};

/** Standalone root layout: the unlock screen sits outside the locale tree and its header/footer. */
export default function UnlockLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cn(fontVariables)}>
      <body>{children}</body>
    </html>
  );
}
