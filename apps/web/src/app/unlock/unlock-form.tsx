'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { shakeInvalidFields } from '@/features/contact/lib/shake-invalid';
import { cn } from '@/utils/cn';
import { unlock, type UnlockState } from './actions';

const initialState: UnlockState = { status: 'idle' };

export function UnlockForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(unlock, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const invalid = state.status === 'invalid';

  useEffect(() => {
    if (!invalid || !formRef.current) return;
    shakeInvalidFields(formRef.current);
    formRef.current.querySelector<HTMLInputElement>('input[name="password"]')?.select();
  }, [state, invalid]);

  return (
    <form ref={formRef} action={action} className="grid w-full gap-4">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="site-password" className="text-sm text-muted">
        كلمة المرور (٤ أرقام)
      </label>
      <input
        id="site-password"
        name="password"
        type="password"
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        minLength={4}
        required
        autoFocus
        autoComplete="current-password"
        dir="ltr"
        aria-invalid={invalid || undefined}
        aria-describedby="site-password-status"
        className={cn(
          'h-16 w-full rounded-2xl border border-line-strong bg-ink text-center font-display text-3xl tracking-[0.6em] tabular-nums outline-none transition-[border-color,box-shadow] duration-250 focus:border-aqua focus:shadow-[0_0_0_3px_rgb(127_238_250/0.15)] aria-invalid:border-danger-line',
        )}
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'جارٍ التحقق…' : 'دخول'}
      </Button>
      <p id="site-password-status" role="status" className="min-h-6 text-center text-[0.9375rem] text-danger">
        {state.status === 'invalid' ? (
          <span key={state.attempt} className="swap-in inline-block">
            كلمة المرور غير صحيحة، حاول مرة أخرى.
          </span>
        ) : null}
      </p>
    </form>
  );
}
