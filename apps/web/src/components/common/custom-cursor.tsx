'use client';

import { useEffect, useRef, useState } from 'react';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { gsap } from '@/lib/gsap';
import { cn } from '@/utils/cn';

/**
 * Soft brand-coloured cursor follower for mouse users. It grows over links and buttons and shows
 * the label of any element carrying `data-cursor="…"`. The native cursor stays visible.
 * Position uses `gsap.quickTo`, one reusable tween per axis.
 */
export function CustomCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    if (!fine || reduced || !dot) return;
    const xTo = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      setVisible(true);
      const target = event.target instanceof Element ? event.target : null;
      setLabel(target?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? null);
      setActive(Boolean(target?.closest('a, button, [role="tab"], label')));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(dot);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed top-0 left-0 z-[70] -mt-2 -ml-2 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'grid size-4 place-items-center rounded-full bg-grad mix-blend-screen transition-[scale,opacity] duration-350 ease-brand',
          label ? 'scale-[5.5]' : active ? 'scale-[2.6] opacity-60' : 'scale-100',
        )}
      />
      {label ? (
        <span className="absolute top-1/2 left-1/2 -translate-1/2 font-display text-sm font-extrabold whitespace-nowrap text-ink">
          {label}
        </span>
      ) : null}
    </div>
  );
}
