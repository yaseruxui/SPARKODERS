/**
 * Dashboard areas a user can be granted. An account with `permissions: null` is a full admin
 * (every area, including managing other users).
 */
export const PERMISSIONS = ['inbox', 'content', 'projects', 'blog', 'media', 'users'] as const;
export type Permission = (typeof PERMISSIONS)[number];
