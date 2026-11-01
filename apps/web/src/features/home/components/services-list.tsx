'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowIcon } from '@/components/ui/icons';
import { Reveal } from '@/components/ui/reveal';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { gsap } from '@/lib/gsap';
import { cn } from '@/utils/cn';
import type { ServiceKey } from '../types';
import { ServiceIcon } from './service-icon';

export interface ServiceRow {
  key: ServiceKey;
  title: string;
  body: string;
  image: string;
  alt: string;
}

interface ServicesListProps {
  rows: readonly ServiceRow[];
  ctaLabel: string;
}

/**
 * Service rows separated by dividers. On mouse devices a picture of the hovered service follows the
 * pointer (the same preview the project list used); touch devices just get the rows.
 */
export function ServicesList({ rows, ctaLabel }: ServicesListProps) {
  const fine = useFinePointer();
  const previewRef = useRef<HTMLDivElement>(null);
  const movers = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  const [hovered, setHovered] = useState<ServiceRow | null>(null);

  useEffect(() => {
    const node = previewRef.current;
    if (!fine || !node) return;
    movers.current = {
      x: gsap.quickTo(node, 'x', { duration: 0.45, ease: 'power3.out' }),
      y: gsap.quickTo(node, 'y', { duration: 0.45, ease: 'power3.out' }),
    };
    return () => {
      movers.current = null;
      gsap.killTweensOf(node);
    };
  }, [fine]);

  const onMove = (event: ReactPointerEvent) => {
    const move = movers.current;
    if (!move) return;
    // Jump straight to the pointer when the picture first appears, then glide.
    if (!hovered && previewRef.current) gsap.set(previewRef.current, { x: event.clientX, y: event.clientY });
    move.x(event.clientX);
    move.y(event.clientY);
  };

  return (
    <>
      <ul
        className="border-t border-white/30"
        onPointerMove={fine ? onMove : undefined}
        onPointerLeave={() => setHovered(null)}
      >
        {rows.map((row, index) => (
          <Reveal as="li" key={row.key} index={index}>
            <a
              href="#contact"
              onPointerEnter={() => setHovered(row)}
              className="group/row grid grid-cols-[auto_1fr_auto] items-center gap-x-[clamp(16px,3vw,40px)] gap-y-1 border-b border-white/30 py-[clamp(18px,2.4vw,28px)] transition-[padding,background-color] duration-400 ease-brand hover:bg-ink/20 hover:px-5 focus-visible:px-5 max-sm:grid-cols-[auto_1fr]"
            >
              <span className="service-icon grid size-[clamp(52px,5.6vw,72px)] place-items-center text-white transition-[scale,rotate,color] duration-500 ease-brand group-hover/row:scale-[1.1] group-hover/row:-rotate-6 group-hover/row:text-aqua max-sm:row-span-2 max-sm:self-start">
                <ServiceIcon service={row.key} />
              </span>
              <span className="grid gap-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10">
                <h3 className="font-display text-[clamp(1.25rem,2.4vw,1.9rem)] leading-[1.35] font-semibold transition-colors duration-300 group-hover/row:text-aqua">
                  {row.title}
                </h3>
                <span className="text-[0.9375rem] text-text/80 sm:text-base">{row.body}</span>
              </span>
              <span className="inline-flex translate-x-3 items-center gap-2 text-sm font-semibold text-aqua opacity-0 transition-[opacity,translate] duration-[300ms,400ms] ease-brand group-hover/row:translate-x-0 group-hover/row:opacity-100 group-focus-visible/row:translate-x-0 group-focus-visible/row:opacity-100 max-sm:hidden ltr:-translate-x-3">
                {ctaLabel}
                <ArrowIcon />
              </span>
            </a>
          </Reveal>
        ))}
      </ul>
      {fine ? (
        <div ref={previewRef} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-30">
          <div
            className={cn(
              'relative aspect-[4/3] w-[400px] -translate-1/2 overflow-hidden rounded-card shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] outline outline-1 -outline-offset-1 outline-white/15 transition-[opacity,scale] duration-[300ms,400ms] ease-brand',
              hovered ? 'scale-100 opacity-100' : 'scale-[0.85] opacity-0',
            )}
          >
            {/* Every picture stays mounted so switching rows never waits on a fetch. */}
            {rows.map((row) => (
              <Image
                key={row.key}
                src={row.image}
                alt=""
                fill
                sizes="400px"
                className={cn(
                  'object-cover transition-opacity duration-300',
                  hovered?.key === row.key ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
