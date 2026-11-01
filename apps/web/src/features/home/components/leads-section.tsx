import { getTranslations } from 'next-intl/server';
import { CanvasSkeleton } from '@/components/feedback/canvas-skeleton';
import { ErrorBoundary } from '@/components/feedback/error-boundary';
import { leadTags } from '../data/content';
import { LeadsPhysics } from './leads-physics';
import { SectionHeading } from './section-heading';

export async function LeadsSection() {
  const t = await getTranslations('home.leads');

  return (
    <article className="relative isolate min-h-[max(100svh,760px)] overflow-hidden border-t border-line pt-[clamp(80px,12vw,150px)]">
      <ErrorBoundary fallback={<CanvasSkeleton />}>
        <LeadsPhysics tags={leadTags.map((key) => t(`tags.${key}`))} ariaLabel={t('canvasAria')} tapLabel={t('tap')} />
      </ErrorBoundary>
      <div className="container-site pointer-events-none relative">
        <SectionHeading align="center" title={t('title')} accent={t('titleAccent')} body={t('body')} />
      </div>
    </article>
  );
}
