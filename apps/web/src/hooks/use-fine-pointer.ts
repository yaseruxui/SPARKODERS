'use client';

import { useMediaQuery } from './use-media-query';

/** True on devices with a precise hovering pointer (mouse/trackpad). */
export function useFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)', false);
}
