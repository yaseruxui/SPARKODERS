import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Permission } from '@sparkoders/contracts';
import type { AuthedRequest } from './session';

export const IS_PUBLIC = 'isPublic';
export const REQUIRED_PERMISSION = 'requiredPermission';

/** Route needs no session (login, invitation, the site's public endpoints). */
export const Public = () => SetMetadata(IS_PUBLIC, true);

/** Route needs this dashboard area; full admins pass everything. */
export const RequirePermission = (permission: Permission) => SetMetadata(REQUIRED_PERMISSION, permission);

/** The signed-in user. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthedRequest>().user,
);
