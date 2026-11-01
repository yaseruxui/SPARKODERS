import { cn } from '@/utils/cn';

/** Status line under a form; each new message cross-blurs in (transitions.dev "text swap soft"). */
export function FormMessage({ message, tone }: { message: string | null; tone: 'ok' | 'error' }) {
  return (
    <p role="status" className={cn('text-[0.9375rem]', tone === 'error' ? 'text-danger' : 'text-aqua')}>
      {message ? (
        <span key={message} className="swap-in inline-block">
          {message}
        </span>
      ) : null}
    </p>
  );
}
