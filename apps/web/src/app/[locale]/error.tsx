'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-site flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold">{t('error.title')}</h1>
      <p className="mt-3 max-w-md text-muted">{t('error.body')}</p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-faint">{error.digest}</p> : null}
      <Button className="mt-8" onClick={reset}>
        {t('tryAgain')}
      </Button>
    </div>
  );
}
