import { Body, Controller, Delete, Get, Header, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  bulkIdsSchema,
  bulkStatusSchema,
  type InboxQuery,
  inboxQuerySchema,
  MESSAGE_STATUSES,
  type MessageStatus,
  noteBodySchema,
  type SessionUser,
  statusUpdateSchema,
} from '@sparkoders/contracts';
import { z } from 'zod';
import { CurrentUser, RequirePermission } from '../auth/decorators';
import { ZodPipe } from '../common/zod.pipe';
import { InboxService } from './inbox.service';

const exportQuerySchema = z.object({ status: z.enum(MESSAGE_STATUSES).optional() });

@RequirePermission('inbox')
@Controller('inbox')
export class InboxController {
  constructor(private readonly inbox: InboxService) {}

  @Get()
  list(@Query(new ZodPipe(inboxQuerySchema)) query: InboxQuery) {
    return this.inbox.list(query);
  }

  @Get('counts')
  counts() {
    return this.inbox.counts();
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="sparkoders-inbox.csv"')
  export(@Query(new ZodPipe(exportQuerySchema)) query: { status?: MessageStatus }) {
    return this.inbox.exportCsv(query.status);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.inbox.get(id);
  }

  @Patch('status')
  @HttpCode(204)
  bulkStatus(@Body(new ZodPipe(bulkStatusSchema)) body: z.infer<typeof bulkStatusSchema>) {
    return this.inbox.setStatus(body.ids, body.status);
  }

  @Patch(':id/status')
  async status(@Param('id') id: string, @Body(new ZodPipe(statusUpdateSchema)) body: { status: MessageStatus }) {
    await this.inbox.setStatus([id], body.status);
    return this.inbox.get(id);
  }

  @Post('bulk-delete')
  @HttpCode(204)
  bulkRemove(@Body(new ZodPipe(bulkIdsSchema)) body: { ids: string[] }) {
    return this.inbox.remove(body.ids);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.inbox.remove([id]);
  }

  @Post(':id/notes')
  addNote(@CurrentUser() user: SessionUser, @Param('id') id: string, @Body(new ZodPipe(noteBodySchema)) body: { body: string }) {
    return this.inbox.addNote(id, user.id, body.body);
  }

  @Delete('notes/:noteId')
  @HttpCode(204)
  removeNote(@Param('noteId') noteId: string) {
    return this.inbox.removeNote(noteId);
  }
}
