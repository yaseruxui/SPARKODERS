'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Fixed header shell. It only tracks whether the page has scrolled (`data-scrolled`); the floating
 * bar inside reads that state to firm up its glass.
 */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="group/header fixed inset-x-0 top-0 z-50 flex h-(--header-h) items-end pb-0"
    >
      {children}
    </header>
  );
}
