/** Shared with the API and the dashboard inbox. */
export { INTEREST_KEYS as interestKeys, type InterestKey } from '@sparkoders/contracts';

/** Result of a form server action, rendered by the client form. */
export type FormStatus =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'invalid'; fields: readonly string[] }
  | { status: 'unconfigured' }
  | { status: 'failed' };

export const initialFormStatus: FormStatus = { status: 'idle' };
