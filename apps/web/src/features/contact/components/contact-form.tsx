'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/field';
import { ArrowIcon } from '@/components/ui/icons';
import { site } from '@/lib/config/site';
import { shakeInvalidFields } from '../lib/shake-invalid';
import { submitContact } from '../services/actions';
import { initialFormStatus, interestKeys } from '../types';
import { FormMessage } from './form-message';
import { Honeypot } from './honeypot';

export function ContactForm({ privacyHref }: { privacyHref: string }) {
  const t = useTranslations('contact');
  const [state, action, pending] = useActionState(submitContact, initialFormStatus);
  const formRef = useRef<HTMLFormElement>(null);
  const invalid = (field: string) => (state.status === 'invalid' && state.fields.includes(field)) || undefined;

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
    if (state.status === 'invalid' && formRef.current) shakeInvalidFields(formRef.current);
  }, [state]);

  const message =
    state.status === 'success'
      ? t('success')
      : state.status === 'invalid'
        ? t('invalid')
        : state.status === 'unconfigured'
          ? t('unconfigured', { email: site.email })
          : state.status === 'failed'
            ? t('failed')
            : null;

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="relative grid gap-[18px] rounded-panel border border-line-strong bg-ink-2/80 p-[clamp(20px,3vw,36px)] sm:grid-cols-2"
    >
      <div className="grid gap-2">
        <Label htmlFor="c-name">{t('fields.name')}</Label>
        <Input id="c-name" name="name" autoComplete="name" required aria-invalid={invalid('name')} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="c-org">{t('fields.organisation')}</Label>
        <Input
          id="c-org"
          name="organisation"
          autoComplete="organization"
          required
          aria-invalid={invalid('organisation')}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="c-email">{t('fields.email')}</Label>
        <Input
          id="c-email"
          type="email"
          name="email"
          dir="ltr"
          autoComplete="email"
          required
          aria-invalid={invalid('email')}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="c-phone">{t('fields.phone')}</Label>
        <Input id="c-phone" type="tel" name="phone" dir="ltr" autoComplete="tel" aria-invalid={invalid('phone')} />
      </div>
      <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0 sm:col-span-2">
        <legend className="mb-2 p-0 text-sm text-muted">{t('fields.interests')}</legend>
        <div className="flex flex-wrap gap-2">
          {interestKeys.map((key) => (
            <label key={key} className="relative cursor-pointer">
              <input
                type="checkbox"
                name="interest"
                value={key}
                className="peer absolute inset-0 cursor-pointer opacity-0"
              />
              <span className="inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-[0.9375rem] transition-[background-color,border-color,color] duration-250 peer-checked:border-transparent peer-checked:bg-grad-soft peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-aqua">
                {t(`interests.${key}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="c-msg">{t('fields.message')}</Label>
        <Textarea id="c-msg" name="message" rows={4} />
      </div>
      <Honeypot />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? t('sending') : t('submit')}
          <ArrowIcon />
        </Button>
        <FormMessage message={message} tone={state.status === 'success' ? 'ok' : 'error'} />
      </div>
      <p className="text-sm text-faint sm:col-span-2">
        {t('privacyNote')}{' '}
        <a href={privacyHref} className="text-muted underline underline-offset-4 hover:text-aqua">
          {t('privacyLink')}
        </a>
        .
      </p>
    </form>
  );
}
