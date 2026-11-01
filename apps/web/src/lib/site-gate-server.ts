import 'server-only';
import { cookies } from 'next/headers';
import { GATE_COOKIE, getGateConfig, isValidGateToken } from './site-gate';

/** For Server Functions: true when the gate is off or this request carries a valid unlock cookie. */
export async function isRequestUnlocked(): Promise<boolean> {
  const config = getGateConfig();
  if (!config) return true;
  return isValidGateToken((await cookies()).get(GATE_COOKIE)?.value, config);
}
