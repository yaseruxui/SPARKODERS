import { ArrowIcon } from '@/components/ui/icons';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import type { ProjectRow } from '../types';
import { ProjectArt } from './project-art';

interface WorkCardsProps {
  rows: readonly ProjectRow[];
  detailsLabel: string;
}

/** Project cards: the interface shot on top, then the category and title; the whole card is the link. */
export function WorkCards({ rows, detailsLabel }: WorkCardsProps) {
  return (
    <ul className="grid gap-[clamp(16px,2vw,28px)] sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row, index) => (
        <Reveal as="li" key={row.key} index={index} className="flex">
          <a
            href={row.href}
            className="group/card flex w-full flex-col overflow-hidden rounded-panel bg-ink-3/60 shadow-[inset_0_0_0_1px_var(--color-line)] transition-[translate,box-shadow] duration-400 ease-brand hover:-translate-y-1.5 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong),0_30px_60px_-30px_rgb(178_108_255/0.45)] focus-visible:-translate-y-1.5"
          >
            <div className="overflow-hidden p-2.5 pb-0">
              <ProjectArt
                accent={row.accent}
                image={row.image}
                alt={row.alt}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 400px"
                className="aspect-[4/3] w-full rounded-[18px] transition-[scale] duration-700 ease-brand group-hover/card:scale-[1.03]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-[clamp(18px,2vw,26px)]">
              <Pill className="self-start">{row.category}</Pill>
              <h3 className="font-display text-[clamp(1.2rem,1.7vw,1.5rem)] leading-[1.4] font-semibold transition-colors duration-300 group-hover/card:text-aqua">
                {row.title}
              </h3>
              <span className="mt-auto inline-flex items-center gap-2 pt-1 text-sm text-muted transition-colors duration-300 group-hover/card:text-aqua">
                {detailsLabel}
                <ArrowIcon />
              </span>
            </div>
          </a>
        </Reveal>
      ))}
    </ul>
  );
}
