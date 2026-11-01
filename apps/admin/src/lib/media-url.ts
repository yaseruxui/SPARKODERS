/** The public site, for previewing images that live there (/images/...). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000';

/** A displayable URL for an image reference: absolute media URLs as is, site paths on the site. */
export function imageSrc(ref: string | null | undefined): string | undefined {
  if (!ref) return undefined;
  return /^https?:\/\//.test(ref) ? ref : `${SITE_URL}${ref.startsWith('/') ? '' : '/'}${ref}`;
}
