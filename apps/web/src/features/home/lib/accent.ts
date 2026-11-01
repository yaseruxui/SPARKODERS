import type { Accent } from '../types';

/** Brand-gradient artwork per accent, used wherever a photo is not supplied yet. */
export const accentBackground: Record<Accent, string> = {
  1: 'bg-[linear-gradient(135deg,var(--color-violet),var(--color-ocean))]',
  2: 'bg-[linear-gradient(135deg,var(--color-ocean),var(--color-aqua))]',
  3: 'bg-[linear-gradient(135deg,var(--color-plum),var(--color-violet))]',
  4: 'bg-[linear-gradient(135deg,var(--color-violet),var(--color-aqua))]',
  5: 'bg-[linear-gradient(135deg,var(--color-ink-3),var(--color-ocean))]',
  6: 'bg-[linear-gradient(135deg,var(--color-aqua),var(--color-lilac))]',
};
