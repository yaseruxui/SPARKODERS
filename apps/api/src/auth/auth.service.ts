import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SessionUser } from '@sparkoders/contracts';
import * as argon2 from 'argon2';
import type { Response } from 'express';
import { env } from '../config/env';
import { hashToken } from '../common/tokens';
import { parsePermissions } from '../common/permissions';
import type { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SESSION_COOKIE, type SessionClaims } from './session';

/** A real hash to compare against when the email is unknown, so timing does not reveal accounts. */
const DUMMY_HASH = argon2.hash('not-a-real-password');

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    permissions: parsePermissions(user.permissions),
    avatarUrl: user.avatarUrl,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string, response: Response): Promise<SessionUser> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const ok = await argon2.verify(user?.passwordHash ?? (await DUMMY_HASH), password);
    if (!user?.passwordHash || !ok) throw new UnauthorizedException('البريد أو كلمة المرور غير صحيحة.');

    const updated = await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.issueSession(updated, response);
    return toSessionUser(updated);
  }

  async issueSession(user: User, response: Response): Promise<void> {
    const { SESSION_DAYS, COOKIE_SAMESITE, NODE_ENV } = env();
    const claims: SessionClaims = { sub: user.id, v: user.tokenVersion };
    const token = await this.jwt.signAsync(claims, { expiresIn: `${SESSION_DAYS}d` });
    response.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: COOKIE_SAMESITE,
      secure: COOKIE_SAMESITE === 'none' || NODE_ENV === 'production',
      maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  clearSession(response: Response): void {
    response.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  /** Who an invitation link is for (to greet them on the "choose a password" screen). */
  async invitation(token: string): Promise<{ name: string; email: string }> {
    const user = await this.findInvited(token);
    return { name: user.name, email: user.email };
  }

  async acceptInvitation(token: string, password: string, response: Response): Promise<SessionUser> {
    const user = await this.findInvited(token);
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await argon2.hash(password),
        invitationTokenHash: null,
        invitationExpiresAt: null,
        tokenVersion: { increment: 1 },
        lastLoginAt: new Date(),
      },
    });
    await this.issueSession(updated, response);
    return toSessionUser(updated);
  }

  async changePassword(userId: string, current: string, next: string, response: Response): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.passwordHash || !(await argon2.verify(user.passwordHash, current))) {
      throw new BadRequestException({ message: 'كلمة المرور الحالية غير صحيحة.', fields: ['currentPassword'] });
    }
    // A new version signs every other session out; this browser gets a fresh cookie.
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(next), tokenVersion: { increment: 1 } },
    });
    await this.issueSession(updated, response);
  }

  private async findInvited(token: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { invitationTokenHash: hashToken(token) } });
    if (!user || !user.invitationExpiresAt || user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('رابط الدعوة غير صالح أو انتهت صلاحيته.');
    }
    return user;
  }
}
