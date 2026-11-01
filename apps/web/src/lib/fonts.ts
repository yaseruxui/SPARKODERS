import localFont from 'next/font/local';

/*
 * Self-hosted faces (SIL OFL), no request ever leaves the origin.
 * Each family is split into a Latin and an Arabic file; the CSS stacks list Latin first so
 * digits and punctuation come from it and Arabic glyphs fall through to the Arabic file —
 * the same split the original unicode-range declarations produced.
 */
export const alexandriaLatin = localFont({
  src: [
    { path: '../assets/fonts/alexandria-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/alexandria-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/alexandria-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-alexandria-latin',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const alexandriaArabic = localFont({
  src: [
    { path: '../assets/fonts/alexandria-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/alexandria-arabic-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/alexandria-arabic-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-alexandria-arabic',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const plexLatin = localFont({
  src: [
    { path: '../assets/fonts/ibm-plex-sans-arabic-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-plex-latin',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

export const plexArabic = localFont({
  src: [
    { path: '../assets/fonts/ibm-plex-sans-arabic-arabic-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-plex-arabic',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const fontVariables = [alexandriaLatin, alexandriaArabic, plexLatin, plexArabic].map((f) => f.variable);
