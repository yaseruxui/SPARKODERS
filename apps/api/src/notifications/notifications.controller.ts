import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { SessionUser } from '@sparkoders/contracts';
import { CurrentUser } from '../auth/decorators';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: SessionUser) {
    return this.notifications.list(user.id);
  }

  @Post('read-all')
  @HttpCode(204)
  readAll(@CurrentUser() user: SessionUser) {
    return this.notifications.read(user.id);
  }

  @Post(':id/read')
  @HttpCode(204)
  read(@CurrentUser() user: SessionUser, @Param('id') id: string) {
    return this.notifications.read(user.id, id);
  }
}
