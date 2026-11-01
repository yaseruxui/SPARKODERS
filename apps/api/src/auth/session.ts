import type { Permission, SessionUser } from '@sparkoders/contracts';
import type { Request } from 'express';

export const SESSION_COOKIE = 'sk_admin_session';

/** What the signed session token carries: the user and the token version it was issued under. */
export interface SessionClaims {
  sub: string;
  v: number;
}

/** The signed-in user, attached to the request by AuthGuard. */
export interface AuthedRequest extends Request {
  user: SessionUser & { permissions: Permission[] | null };
}
