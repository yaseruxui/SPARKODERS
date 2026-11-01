import type { MetadataRoute } from 'next';
import { site } from '@/lib/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SPARKODERS — Spark Coders',
    short_name: site.wordmark,
    start_url: '/ar',
    display: 'standalone',
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [{ src: site.logo, sizes: '512x512', type: 'image/png', purpose: 'any' }],
  };
}
