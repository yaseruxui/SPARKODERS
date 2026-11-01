import { createHmac, timingSafeEqual } from 'node:crypto';
import { getServerEnv } from '@/lib/env';

/**
 * Optional password gate for the whole site. Enabled when both SITE_PASSWORD and SITE_GATE_SECRET
 * are set. A visitor who enters the password gets an httpOnly cookie holding an HMAC of the
 * password under the secret, so changing either one signs everybody out.
 */
export const GATE_COOKIE = 'skodr_gate';
export const GATE_MAX_AGE = 60 * 60 * 24 * 30;

export interface GateConfig {
  password: string;
  secret: string;
}

export function getGateConfig(): GateConfig | null {
  const { SITE_PASSWORD, SITE_GATE_SECRET } = getServerEnv();
  return SITE_PASSWORD && SITE_GATE_SECRET ? { password: SITE_PASSWORD, secret: SITE_GATE_SECRET } : null;
}

export function gateToken(config: GateConfig): string {
  return createHmac('sha256', config.secret).update(`skodr-gate:v1:${config.password}`).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isValidGateToken(token: string | undefined, config: GateConfig): boolean {
  return typeof token === 'string' && safeEqual(token, gateToken(config));
}

export function isCorrectPassword(candidate: string, config: GateConfig): boolean {
  return safeEqual(candidate, config.password);
}

/** Only same-site paths are allowed as the post-unlock destination. */
export function safeNextPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/ar';
  }
  return value;
}
