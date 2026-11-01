import { useId } from 'react';

export type AvatarVariant = 'shemagh' | 'hijab' | 'ghutra' | 'hijabLight';

interface Look {
  skin: string;
  /** Head cloth (ghutra / shemagh / hijab) and the garment below it. */
  cloth: string;
  garment: string;
  hair: string;
  checks?: string;
  agal?: boolean;
  beard?: boolean;
  glasses?: boolean;
  hijab?: boolean;
}

const LOOKS: Record<AvatarVariant, Look> = {
  shemagh: {
    skin: '#c68b5e',
    cloth: '#ffffff',
    checks: '#d8343f',
    garment: '#f4f1ec',
    hair: '#2a1a12',
    agal: true,
    beard: true,
  },
  hijab: { skin: '#e2ad86', cloth: '#1f5c4b', garment: '#184a3c', hair: '#2a1a12', hijab: true },
  ghutra: {
    skin: '#b9784d',
    cloth: '#ffffff',
    garment: '#f4f1ec',
    hair: '#1d130d',
    agal: true,
    beard: true,
    glasses: true,
  },
  hijabLight: { skin: '#f0c29e', cloth: '#c9a98f', garment: '#3b2f5c', hair: '#2a1a12', hijab: true },
};

/**
 * Illustrated portrait in the flat style of the brand's people avatars: drawn inline (no image
 * request), so it never stands in for a real person. Fills its (round) container.
 */
export function ArabAvatar({ variant }: { variant: AvatarVariant }) {
  const look = LOOKS[variant];
  const id = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full">
      {look.checks ? (
        <defs>
          <pattern id={`${id}-checks`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={look.cloth} />
            <rect width="3" height="3" fill={look.checks} />
            <rect x="3" y="3" width="3" height="3" fill={look.checks} />
          </pattern>
        </defs>
      ) : null}

      {/* Shoulders */}
      <path d="M8 104C10 82 26 72 50 72s40 10 42 32Z" fill={look.garment} />
      {/* Neck */}
      <path d="M42 60h16v14c-4 4-12 4-16 0Z" fill={look.skin} />
      <path d="M42 66c5 3 11 3 16 0v-4H42Z" fill="#000" opacity="0.12" />

      {look.hijab ? (
        <>
          {/* Hijab: wraps the head, frames the face and falls over the shoulders. */}
          <path
            d="M50 16c-16 0-26 12-26 28 0 10 3 18 8 24-6 4-12 10-14 20 10-6 20-9 32-9s22 3 32 9c-2-10-8-16-14-20 5-6 8-14 8-24 0-16-10-28-26-28Z"
            fill={look.cloth}
          />
          <ellipse cx="50" cy="47" rx="14" ry="17" fill={look.skin} />
          <path d="M35 40c3-11 9-16 15-16s12 5 15 16c-4-6-9-8-15-8s-11 2-15 8Z" fill={look.cloth} />
        </>
      ) : (
        <>
          {/* Head cloth falling behind the shoulders */}
          <path
            d="M30 40c0-14 9-22 20-22s20 8 20 22l6 40c-8-4-14-8-18-12V44H42v24c-4 4-10 8-18 12Z"
            fill={look.checks ? `url(#${id}-checks)` : look.cloth}
          />
          <ellipse cx="50" cy="46" rx="14" ry="17" fill={look.skin} />
          {/* Cloth edge across the forehead */}
          <path
            d="M33 42c1-10 8-16 17-16s16 6 17 16c-5-5-10-7-17-7s-12 2-17 7Z"
            fill={look.checks ? `url(#${id}-checks)` : look.cloth}
          />
          <path d="M33 42c5-5 10-7 17-7s12 2 17 7" fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="1.2" />
          {look.agal ? <rect x="31" y="23" width="38" height="5" rx="2.5" fill="#15121c" /> : null}
        </>
      )}

      {/* Ears */}
      {!look.hijab ? (
        <>
          <ellipse cx="36" cy="49" rx="2.4" ry="3.6" fill={look.skin} />
          <ellipse cx="64" cy="49" rx="2.4" ry="3.6" fill={look.skin} />
        </>
      ) : null}

      {look.beard ? (
        <path d="M37 48c0 12 6 20 13 20s13-8 13-20c-2 5-5 8-8 8-2-2-8-2-10 0-3 0-6-3-8-8Z" fill={look.hair} />
      ) : null}

      {/* Brows, eyes, smile */}
      <path
        d="M41 42.5q3.5-2 7 0M52 42.5q3.5-2 7 0"
        fill="none"
        stroke={look.hair}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="44.5" cy="47" r="1.6" fill="#1b1220" />
      <circle cx="55.5" cy="47" r="1.6" fill="#1b1220" />
      <path
        d="M45.5 56q4.5 3.6 9 0"
        fill="none"
        stroke={look.beard ? '#f6e7dc' : '#8a3f3a'}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {look.hijab ? (
        <>
          <circle cx="41" cy="52" r="2.4" fill="#e9827a" opacity="0.35" />
          <circle cx="59" cy="52" r="2.4" fill="#e9827a" opacity="0.35" />
        </>
      ) : null}
      {look.glasses ? (
        <g fill="none" stroke="#15121c" strokeWidth="1.4">
          <rect x="39" y="43.5" width="9.5" height="7" rx="2.5" />
          <rect x="51.5" y="43.5" width="9.5" height="7" rx="2.5" />
          <path d="M48.5 46.5h3" />
        </g>
      ) : null}
    </svg>
  );
}
