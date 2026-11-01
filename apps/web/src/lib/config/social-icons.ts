import { siBehance, siInstagram, siX } from 'simple-icons';
import type { SocialKey } from './site';

/**
 * 24×24 glyph paths for the social links. Instagram, X and Behance come from Simple Icons (CC0);
 * LinkedIn is no longer published there, so its plain "in" glyph is drawn here.
 */
export const socialIconPaths: Record<SocialKey, string> = {
  linkedin:
    'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3Zm6.5 0h3.8v1.6h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.55 4.78 5.87V21h-4v-4.86c0-1.16-.02-2.65-1.66-2.65-1.66 0-1.92 1.26-1.92 2.57V21h-4Z',
  instagram: siInstagram.path,
  x: siX.path,
  behance: siBehance.path,
};
