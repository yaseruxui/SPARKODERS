import { cn } from '@/utils/cn';

/** Intrinsic size of the Sparkoders "S" mark (its own coordinate space, 10–1985 × 10–1365). */
export const MARK_VIEWBOX = { x: 10, y: 10, width: 1975, height: 1355 } as const;

interface SparkMarkProps {
  /** Unique per instance on a page: prefixes the gradient and clip-path ids. */
  id: string;
  className?: string;
  title?: string;
}

/** The Sparkoders "S": two folded ribbons drawn as vectors, exactly as in the brand logo file. */
export function SparkMark({ id, className, title }: SparkMarkProps) {
  return (
    <svg
      viewBox="10 10 1975 1355"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn('block h-auto', className)}
    >
      <defs>
        <path
          id={`${id}-topShape`}
          d="M935 10H1985L1615 360Q1565 400 1485 400H955Q840 400 818 488Q812 545 865 590L1105 830H420Q300 830 240 760Q200 705 212 640Q222 565 290 505L780 70Q850 10 935 10Z"
        />
        <path
          id={`${id}-bottomShape`}
          d="M10 1365L405 1010Q450 975 525 975H1320Q1385 975 1388 912Q1388 875 1360 852L1010 560H1540Q1640 560 1715 635L1880 795Q1928 845 1925 905Q1920 965 1865 1012L1455 1340Q1415 1365 1345 1365Z"
        />
        <clipPath id={`${id}-topClip`}>
          <use href={`#${id}-topShape`} />
        </clipPath>
        <clipPath id={`${id}-bottomClip`}>
          <use href={`#${id}-bottomShape`} />
        </clipPath>
        <linearGradient id={`${id}-topBand`} x1="210" y1="0" x2="1985" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7A1FD6" />
          <stop offset="0.3" stopColor="#9333EA" />
          <stop offset="0.75" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#00C2CF" />
        </linearGradient>
        <linearGradient id={`${id}-topFold`} x1="480" y1="520" x2="1100" y2="830" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#24189A" />
          <stop offset="0.55" stopColor="#2B3FB8" />
          <stop offset="1" stopColor="#0FB3C2" />
        </linearGradient>
        <linearGradient id={`${id}-bottomBand`} x1="10" y1="0" x2="1700" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7DF3FF" />
          <stop offset="0.45" stopColor="#48B8F5" />
          <stop offset="1" stopColor="#1263D9" />
        </linearGradient>
        <linearGradient id={`${id}-bottomFace`} x1="0" y1="560" x2="0" y2="980" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1FB3EA" />
          <stop offset="0.6" stopColor="#4AB4F8" stopOpacity="0.6" />
          <stop offset="1" stopColor="#4AB4F8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-bottomShadow`} cx="1560" cy="1010" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A4FCC" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0A4FCC" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-bottomFold`} x1="1150" y1="1365" x2="1925" y2="800" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#7B2FD8" />
        </linearGradient>
      </defs>
      {/* top ribbon */}
      <use href={`#${id}-topShape`} fill={`url(#${id}-topBand)`} />
      <path
        clipPath={`url(#${id}-topClip)`}
        fill={`url(#${id}-topFold)`}
        d="M290 815Q395 805 470 740L720 480Q810 403 955 400Q840 400 818 488Q812 545 865 590L1105 830H290Z"
      />
      {/* bottom ribbon */}
      <use href={`#${id}-bottomShape`} fill={`url(#${id}-bottomBand)`} />
      <g clipPath={`url(#${id}-bottomClip)`}>
        <rect x="0" y="550" width="2000" height="440" fill={`url(#${id}-bottomFace)`} />
        <rect x="1200" y="700" width="700" height="640" fill={`url(#${id}-bottomShadow)`} />
        <path fill={`url(#${id}-bottomFold)`} d="M1100 1420L1640 880Q1715 800 1800 795Q1960 800 1960 905V1420Z" />
      </g>
    </svg>
  );
}
