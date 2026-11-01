import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations('common.notFound');
  return (
    <div className="container-site flex min-h-[80svh] flex-col items-center justify-center pt-(--header-h) text-center">
      <p className="font-display text-violet text-[clamp(5rem,18vw,12rem)] leading-none font-extrabold" dir="ltr">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-extrabold">{t('title')}</h1>
      <p className="mt-3 text-muted">{t('body')}</p>
      <ButtonLink href="./" className="mt-8">
        {t('home')}
      </ButtonLink>
    </div>
  );
}
