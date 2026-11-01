import type { Permission, SessionUser } from '@sparkoders/contracts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';

export const sessionKey = ['session'] as const;

/** The signed-in user, or null when signed out. */
export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: async () => {
      try {
        return await api<SessionUser>('/auth/me');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function can(user: SessionUser | null | undefined, permission: Permission): boolean {
  return !!user && (user.permissions === null || user.permissions.includes(permission));
}

export function useSignOut() {
  const client = useQueryClient();
  return async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    client.setQueryData(sessionKey, null);
    client.removeQueries({ predicate: (q) => q.queryKey[0] !== sessionKey[0] });
  };
}
