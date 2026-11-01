'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/** Registers the plugins once on the client; import GSAP from here so registration always runs first. */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

gsap.defaults({ ease: 'expo.out', duration: 0.8 });

/** Matches `prefers-reduced-motion` the way `gsap.matchMedia()` contexts expect. */
export const motionQueries = {
  full: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
