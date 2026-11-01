import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/utils/cn';
import { delightSteps } from '../data/content';
import { SectionHeading } from './section-heading';

const indent = ['', 'lg:ms-[6%]', 'lg:ms-[12%]', 'lg:ms-[18%]', 'lg:ms-[24%]'] as const;

/** How we work: five steps from the first conversation to launch, each with one line on what happens. */
export async function DelightSection() {
  const t = await getTranslations('home.delight');

  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-line bg-ink-2 py-[clamp(80px,12vw,150px)]"
    >
      <div className="container-site grid items-center gap-[clamp(32px,6vw,96px)] lg:grid-cols-[1.1fr_1fr]">
        <SectionHeading className="lg:order-2" title={t('title')} accent={t('titleAccent')} body={t('body')} />
        <ol className="grid gap-3">
          {delightSteps.map((key, index) => {
            const goal = index === delightSteps.length - 1;
            return (
              <Reveal
                as="li"
                key={key}
                index={index}
                className={cn(
                  'flex items-start gap-4 rounded-2xl border px-5 py-4 transition-[translate,border-color] duration-500 ease-brand hover:-translate-x-1.5 hover:border-aqua ltr:hover:translate-x-1.5',
                  goal ? 'border-transparent bg-grad' : 'border-line-strong bg-glass',
                  indent[index],
                )}
              >
                <span
                  className={cn(
                    'mt-1 font-display text-[0.8125rem] tabular-nums',
                    goal ? 'text-white/80' : 'text-faint',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <b className="block font-display text-lg font-semibold">{t(`steps.${key}.title`)}</b>
                  <span className={cn('block text-[0.9375rem]', goal ? 'text-white/85' : 'text-muted')}>
                    {t(`steps.${key}.body`)}
                  </span>
                </span>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
