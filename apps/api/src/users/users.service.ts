import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { InviteUserInput, UpdateUserInput, UserListItem } from '@sparkoders/contracts';
import { env } from '../config/env';
import { emailHtml, MailService } from '../mail/mail.service';
import { parsePermissions } from '../common/permissions';
import { newToken } from '../common/tokens';
import { Prisma, type User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Invitation links stay valid for a week. */
const INVITATION_DAYS = 7;

function toListItem(user: User): UserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    permissions: parsePermissions(user.permissions),
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    invitationPending: !user.passwordHash,
  };
}

/** JSON column value: SQL NULL for full admins, otherwise the list. */
function permissionsValue(permissions: string[] | null) {
  return permissions === null ? Prisma.DbNull : permissions;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** Emails the invitation link when mail is set up; the dashboard shows the link either way. */
  private sendInvitation(user: { name: string; email: string }, url: string): Promise<boolean> {
    return this.mail.send({
      to: user.email,
      subject: 'دعوة للانضمام إلى لوحة تحكم SPARKODERS',
      text: `أهلًا ${user.name}، تمت دعوتك إلى لوحة تحكم سبارك كودرز. اختر كلمة مرورك من هذا الرابط (صالح 7 أيام): ${url}`,
      html: emailHtml(`أهلًا ${user.name}`, ['تمت دعوتك إلى لوحة تحكم سبارك كودرز.', 'الرابط صالح لمدة 7 أيام.'], { label: 'اختر كلمة المرور', url }),
    });
  }

  async list(): Promise<UserListItem[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return users.map(toListItem);
  }

  /**
   * Creates the account and returns the invitation link; it is also emailed when mail settings
   * are configured (Settings → Mail).
   */
  async invite(input: InviteUserInput): Promise<{ user: UserListItem; invitationUrl: string; emailed: boolean }> {
    const email = input.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException({ message: 'هذا البريد مستخدم بالفعل.', fields: ['email'] });
    }
    const { token, hash } = newToken();
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email,
        permissions: permissionsValue(input.permissions),
        invitationTokenHash: hash,
        invitationExpiresAt: new Date(Date.now() + INVITATION_DAYS * 86_400_000),
      },
    });
    const invitationUrl = this.invitationUrl(token);
    return { user: toListItem(user), invitationUrl, emailed: await this.sendInvitation(user, invitationUrl) };
  }

  /** A fresh link for someone who has not accepted yet (the old one stops working). */
  async reinvite(id: string): Promise<{ invitationUrl: string; emailed: boolean }> {
    const user = await this.find(id);
    if (user.passwordHash) throw new BadRequestException('هذا المستخدم فعّل حسابه بالفعل.');
    const { token, hash } = newToken();
    await this.prisma.user.update({
      where: { id },
      data: { invitationTokenHash: hash, invitationExpiresAt: new Date(Date.now() + INVITATION_DAYS * 86_400_000) },
    });
    const invitationUrl = this.invitationUrl(token);
    return { invitationUrl, emailed: await this.sendInvitation(user, invitationUrl) };
  }

  async update(actorId: string, id: string, input: UpdateUserInput): Promise<UserListItem> {
    await this.find(id);
    if (id === actorId && input.permissions !== undefined && input.permissions !== null) {
      throw new BadRequestException('لا يمكنك تقليل صلاحياتك بنفسك.');
    }
    if (input.permissions !== undefined && input.permissions !== null) await this.keepOneAdmin(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        permissions: input.permissions === undefined ? undefined : permissionsValue(input.permissions),
        // Changed permissions take effect on the next request; sessions stay valid.
      },
    });
    return toListItem(user);
  }

  async remove(actorId: string, ids: string[]): Promise<void> {
    if (ids.includes(actorId)) throw new BadRequestException('لا يمكنك حذف حسابك.');
    for (const id of ids) await this.keepOneAdmin(id);
    await this.prisma.user.deleteMany({ where: { id: { in: ids } } });
  }

  private async find(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }

  /** Refuses a change that would leave no active full admin. */
  private async keepOneAdmin(changingId: string): Promise<void> {
    const admins = (await this.prisma.user.findMany({ where: { passwordHash: { not: null } } })).filter(
      (u) => parsePermissions(u.permissions) === null,
    );
    if (admins.length === 1 && admins[0]?.id === changingId) {
      throw new BadRequestException('يجب أن يبقى مدير واحد على الأقل بصلاحيات كاملة.');
    }
  }

  private invitationUrl(token: string): string {
    return `${env().ADMIN_URL}/invitation/${token}`;
  }
}
