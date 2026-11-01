import { PERMISSIONS, type Permission } from '@sparkoders/contracts';

/** Reads the JSON column: null = full admin, otherwise the known keys it lists. */
export function parsePermissions(value: unknown): Permission[] | null {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value)) return [];
  return value.filter((p): p is Permission => (PERMISSIONS as readonly string[]).includes(p as string));
}

export function hasPermission(granted: Permission[] | null, needed: Permission): boolean {
  return granted === null || granted.includes(needed);
}
