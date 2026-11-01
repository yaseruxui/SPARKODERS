import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Permission } from '@sparkoders/contracts';
import type { Request } from 'express';
import { hasPermission, parsePermissions } from '../common/permissions';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC, REQUIRED_PERMISSION } from './decorators';
import { type AuthedRequest, SESSION_COOKIE, type SessionClaims } from './session';

/** Header every dashboard request sends; cross-site forms cannot set it, so it doubles as CSRF protection. */
export const CLIENT_HEADER = 'x-sparkoders-admin';

/**
 * Global guard: every route needs a valid session unless marked @Public(). The session is a JWT in
 * an httpOnly cookie; its version must match the user's (bumped on password change), and
 * state-changing requests must carry the dashboard header.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'GET' && request.get(CLIENT_HEADER) !== '1') {
      throw new ForbiddenException('Missing dashboard header');
    }

    const token: unknown = request.cookies?.[SESSION_COOKIE];
    if (typeof token !== 'string') throw new UnauthorizedException();
    let claims: SessionClaims;
    try {
      claims = await this.jwt.verifyAsync<SessionClaims>(token);
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({ where: { id: claims.sub } });
    if (!user || !user.passwordHash || user.tokenVersion !== claims.v) throw new UnauthorizedException();

    const permissions = parsePermissions(user.permissions);
    const needed = this.reflector.getAllAndOverride<Permission | undefined>(REQUIRED_PERMISSION, targets);
    if (needed && !hasPermission(permissions, needed)) {
      throw new ForbiddenException('ليس لديك صلاحية لهذا القسم.');
    }

    (request as AuthedRequest).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      permissions,
      avatarUrl: user.avatarUrl,
    };
    return true;
  }
}
