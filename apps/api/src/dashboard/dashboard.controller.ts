import { Controller, Get } from '@nestjs/common';
import type { SessionUser } from '@sparkoders/contracts';
import { CurrentUser } from '../auth/decorators';
import { hasPermission } from '../common/permissions';
import { InboxService } from '../inbox/inbox.service';
import { PrismaService } from '../prisma/prisma.service';

/** The overview screen: what needs attention, limited to the areas the user can see. */
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly inbox: InboxService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async summary(@CurrentUser() user: SessionUser) {
    const canInbox = hasPermission(user.permissions, 'inbox');
    const canUsers = hasPermission(user.permissions, 'users');
    const [counts, latest, users] = await Promise.all([
      canInbox ? this.inbox.counts() : null,
      canInbox ? this.inbox.list({ page: 1, perPage: 5 }) : null,
      canUsers ? this.prisma.user.count() : null,
    ]);
    return { inbox: counts && latest ? { counts, latest: latest.items } : null, users };
  }
}
