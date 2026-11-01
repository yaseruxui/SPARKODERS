import Image from 'next/image';
import { cn } from '@/utils/cn';
import { accentBackground } from '../lib/accent';
import type { Accent } from '../types';

interface ProjectArtProps {
  accent: Accent;
  image: string | null;
  alt: string;
  sizes: string;
  className?: string;
}

/** A project or post visual: the photo when supplied, otherwise a brand-gradient mock screen. */
export function ProjectArt({ accent, image, alt, sizes, className }: ProjectArtProps) {
  return (
    <figure
      className={cn(
        'relative m-0 overflow-hidden outline outline-1 -outline-offset-1 outline-white/10',
        accentBackground[accent],
        className,
      )}
    >
      {image ? (
        <Image src={image} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0">
          <span className="absolute inset-x-[10%] top-[14%] h-[10%] rounded-lg bg-ink/55" />
          <span className="absolute inset-x-[10%] top-[32%] bottom-[12%] rounded-lg bg-ink/30" />
        </div>
      )}
    </figure>
  );
}
