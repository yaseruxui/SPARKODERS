/** Brand facts that do not change between locales. */
export const site = {
  wordmark: 'SPARKODERS',
  slogan: 'Crafting Digital Excellence',
  domain: 'sparkoders.com',
  email: 'support@sparkoders.com',
  phone: '+000000000',
  phoneDisplay: '+000 000 000',
  /** WhatsApp number in international format, digits only (placeholder until the real one is set). */
  whatsapp: '000000000000',
  /** Square raster mark for structured data, manifest and social cards. */
  logo: '/brand/sparkoders-mark-512.png',
  /** Trimmed mark used in the interface (intrinsic 640×442). */
  mark: { src: '/brand/sparkoders-mark.webp', width: 640, height: 439 },
  /** Opaque, colour-bled copy of the mark used as the 3D model's texture. */
  markTexture: '/brand/sparkoders-mark-texture.webp',
  themeColor: '#07051a',
  socials: [
    { key: 'linkedin', href: '#' },
    { key: 'instagram', href: '#' },
    { key: 'x', href: '#' },
    { key: 'behance', href: '#' },
  ],
} as const;

export type SocialKey = (typeof site.socials)[number]['key'];
