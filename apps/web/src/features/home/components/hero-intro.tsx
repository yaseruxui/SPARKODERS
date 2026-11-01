'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionQueries, SplitText, useGSAP } from '@/lib/gsap';

interface HeroIntroProps {
  intro: ReactNode;
  lines: readonly [string, string];
  rotator: ReactNode;
  actions: ReactNode;
}

/** Seconds the first-visit logo intro covers the page (see PageLoader). */
const LOADER_HOLD = 1.55;

/**
 * Hero copy with the page's opening sequence: the headline rises line by line out of its own
 * masks, then the lead and the actions resolve in. While the visitor scrolls away the block
 * drifts up and dims, handing over to the 3D intro below.
 */
export function HeroIntro({ intro, lines, rotator, actions }: HeroIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(motionQueries.full, () => {
        const delay = document.documentElement.dataset.intro === 'playing' ? LOADER_HOLD : 0.15;
        const headline = root.querySelectorAll<HTMLElement>('[data-hero-line]');
        const supporting = root.querySelectorAll<HTMLElement>('[data-hero-soft]');

        gsap.set(root.querySelectorAll('[data-hero-reveal]'), { visibility: 'visible' });

        SplitText.create(headline, {
          type: 'lines',
          mask: 'lines',
          // Arabic dots, shaddas and descenders reach past the line box; globals.css gives each mask room for them.
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              stagger: 0.12,
              ease: 'expo.out',
              delay,
            });
          },
        });

        gsap.from(supporting, {
          autoAlpha: 0,
          y: 12,
          filter: 'blur(3px)',
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: delay + 0.45,
          clearProps: 'filter',
        });

        gsap.to(root, {
          yPercent: -10,
          autoAlpha: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: root.parentElement, start: 'top top', end: 'bottom top', scrub: true },
        });
      });

      mm.add(motionQueries.reduced, () => {
        gsap.set(root.querySelectorAll('[data-hero-reveal]'), { visibility: 'visible' });
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef}>
      <h1 className="font-display text-[clamp(2.25rem,8vw,3.5rem)] lg:text-[clamp(3rem,4.4vw,4.25rem)] leading-[1.32] font-extrabold tracking-[-0.01em] [text-wrap:wrap]">
        <span data-hero-reveal="" data-hero-line="" className="block">
          {lines[0]}
        </span>
        <span data-hero-reveal="" data-hero-line="" className="block">
          {lines[1]}
        </span>
        <span data-hero-reveal="" data-hero-soft="" className="block">
          {rotator}
        </span>
      </h1>
      <p
        data-hero-reveal=""
        data-hero-soft=""
        className="mt-[clamp(20px,3vw,32px)] max-w-[36rem] text-lg leading-relaxed text-muted sm:text-xl"
      >
        {intro}
      </p>
      <div data-hero-reveal="" data-hero-soft="" className="mt-[clamp(24px,3vw,36px)] flex flex-wrap gap-3">
        {actions}
      </div>
    </div>
  );
}
