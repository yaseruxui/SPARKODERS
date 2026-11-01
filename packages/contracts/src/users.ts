import { z } from 'zod';
import { PERMISSIONS } from './permissions';

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  /** null = full admin. */
  permissions: z.array(z.enum(PERMISSIONS)).nullable(),
  avatarUrl: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const loginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const userListItemSchema = sessionUserSchema.extend({
  createdAt: z.string(),
  lastLoginAt: z.string().nullable(),
  invitationPending: z.boolean(),
});
export type UserListItem = z.infer<typeof userListItemSchema>;

/** Inviting a teammate: they receive a link to choose their own password. */
export const inviteUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  permissions: z.array(z.enum(PERMISSIONS)).nullable(),
});
export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).nullable().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  password: z.string().min(8).max(200),
});

export const updateProfileSchema = z.object({ name: z.string().trim().min(2).max(120) });
