'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { GATE_COOKIE, GATE_MAX_AGE, gateToken, getGateConfig, isCorrectPassword, safeNextPath } from '@/lib/site-gate';

/** `attempt` changes on every failure so the message replays its entrance. */
export type UnlockState = { status: 'idle' } | { status: 'invalid'; attempt: number };

/** Slows down guessing: four digits are only 10,000 combinations. */
const FAILURE_DELAY_MS = 1200;

export async function unlock(previous: UnlockState, form: FormData): Promise<UnlockState> {
  const config = getGateConfig();
  const next = safeNextPath(form.get('next'));
  if (!config) redirect(next);

  const candidate = form.get('password');
  if (typeof candidate !== 'string' || !/^\d{4}$/.test(candidate) || !isCorrectPassword(candidate, config)) {
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    return { status: 'invalid', attempt: previous.status === 'invalid' ? previous.attempt + 1 : 1 };
  }

  (await cookies()).set(GATE_COOKIE, gateToken(config), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: GATE_MAX_AGE,
  });
  redirect(next);
}
