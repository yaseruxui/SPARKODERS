import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  bulkIdsSchema,
  type InviteUserInput,
  inviteUserSchema,
  type SessionUser,
  type UpdateUserInput,
  updateUserSchema,
} from '@sparkoders/contracts';
import { CurrentUser, RequirePermission } from '../auth/decorators';
import { ZodPipe } from '../common/zod.pipe';
import { UsersService } from './users.service';

@RequirePermission('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  invite(@Body(new ZodPipe(inviteUserSchema)) body: InviteUserInput) {
    return this.users.invite(body);
  }

  @Post(':id/invitation')
  reinvite(@Param('id') id: string) {
    return this.users.reinvite(id);
  }

  @Patch(':id')
  update(@CurrentUser() actor: SessionUser, @Param('id') id: string, @Body(new ZodPipe(updateUserSchema)) body: UpdateUserInput) {
    return this.users.update(actor.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() actor: SessionUser, @Param('id') id: string) {
    return this.users.remove(actor.id, [id]);
  }

  @Post('bulk-delete')
  @HttpCode(204)
  bulkRemove(@CurrentUser() actor: SessionUser, @Body(new ZodPipe(bulkIdsSchema)) body: { ids: string[] }) {
    return this.users.remove(actor.id, body.ids);
  }
}
