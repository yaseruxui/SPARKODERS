import { SparkMark } from '@/components/common/spark-mark';
import { Wordmark } from '@/components/common/wordmark';
import { site } from '@/lib/config/site';
import { safeNextPath } from '@/lib/site-gate';
import { UnlockForm } from './unlock-form';

export default async function UnlockPage({ searchParams }: PageProps<'/unlock'>) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(45%_45%_at_80%_20%,rgb(178_108_255/0.25),transparent_70%),radial-gradient(40%_40%_at_15%_85%,rgb(12_142_199/0.2),transparent_70%)] px-(--gutter)">
      <div className="grid w-full max-w-sm justify-items-center gap-8 text-center">
        <div dir="ltr" className="flex items-center gap-3">
          <SparkMark id="unlock-mark" className="w-[64px]" />
          <Wordmark withSlogan title={site.wordmark} className="w-[220px] text-text" />
        </div>
        <div className="grid gap-2">
          <h1 className="font-display text-2xl font-extrabold">الموقع خاص حاليًا</h1>
          <p className="text-muted">أدخل كلمة المرور للمتابعة.</p>
        </div>
        <UnlockForm next={safeNextPath(Array.isArray(next) ? next[0] : next)} />
      </div>
    </main>
  );
}
