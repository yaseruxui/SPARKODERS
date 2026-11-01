/** Base URL of apps/api. */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:4000';

/** An API error with the server's message and, for validation errors, the failing field paths. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields: string[] = [],
  ) {
    super(message);
  }
}

/**
 * fetch for the API: sends the session cookie and the dashboard header (which the API requires on
 * every change, so other sites cannot forge requests), parses JSON, throws ApiError.
 */
export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? 'GET',
    credentials: 'include',
    headers: {
      'x-sparkoders-admin': '1',
      ...(init.body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = (data ?? {}) as { message?: unknown; fields?: unknown };
    const message = typeof body.message === 'string' ? body.message : 'حدث خطأ غير متوقع، حاول مرة أخرى.';
    throw new ApiError(response.status, message, Array.isArray(body.fields) ? (body.fields as string[]) : []);
  }
  return data as T;
}
