import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { FULL_HEIGHT, NAME_PATH, SLOGAN_PATH, WIDTH } from '@/components/common/wordmark';
import { site } from '@/lib/config/site';
import { routing } from '@/lib/i18n/routing';

export const alt = 'SPARKODERS — Spark Coders';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Brand card: the S mark and SPARKODERS lettering on the dark gradient (vector text, no font fetch). */
export default async function OpengraphImage() {
  const mark = await readFile(join(process.cwd(), 'public', site.logo));
  const markSrc = `data:image/png;base64,${mark.toString('base64')}`;
  const wordmarkWidth = 640;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        background:
          'radial-gradient(60% 80% at 15% 20%, rgba(178,108,255,0.4), transparent 70%), radial-gradient(50% 70% at 85% 80%, rgba(12,142,199,0.35), transparent 70%), #07051A',
      }}
    >
      <img src={markSrc} width={260} height={260} alt="" />
      <svg width={wordmarkWidth} height={(wordmarkWidth * FULL_HEIGHT) / WIDTH} viewBox={`0 0 ${WIDTH} ${FULL_HEIGHT}`}>
        <path d={NAME_PATH} fill="#F5F2FF" />
        <path d={SLOGAN_PATH} fill="#ABA5D3" />
      </svg>
    </div>,
    size,
  );
}
