'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from 'react';

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Stagger index; each step adds 80 ms of delay (cycles every three items like the original). */
  index?: number;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/** Fades and lifts its content into view once, the first time it scrolls into the viewport. */
export function Reveal<T extends ElementType = 'div'>({ as, index = 0, style, ...props }: RevealProps<T>) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.setAttribute('data-in', '');
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <Tag ref={ref} data-reveal="" style={{ '--reveal-delay': `${(index % 3) * 0.08}s`, ...style }} {...props} />;
}
