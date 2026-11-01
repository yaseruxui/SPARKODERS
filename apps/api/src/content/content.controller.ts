import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, NotFoundException, Param, Patch, Post, Put, Query } from '@nestjs/common';
import {
  COLLECTION_PERMISSION,
  type CollectionKey,
  itemInputSchema,
  reorderSchema,
  type SessionUser,
  type SiteSettings,
  siteSettingsSchema,
  textUpdateSchema,
} from '@sparkoders/contracts';
import type { z } from 'zod';
import { CurrentUser, RequirePermission } from '../auth/decorators';
import { hasPermission } from '../common/permissions';
import { ZodPipe } from '../common/zod.pipe';
import { ContentService, isCollection } from './content.service';

/** The collection, if it exists and this user may edit it (projects and posts have their own permissions). */
function collectionFor(user: SessionUser, value: string): CollectionKey {
  if (!isCollection(value)) throw new NotFoundException();
  if (!hasPermission(user.permissions, COLLECTION_PERMISSION[value])) throw new ForbiddenException('ليس لديك صلاحية لهذا القسم.');
  return value;
}

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @RequirePermission('content')
  @Get('texts')
  texts() {
    return this.content.texts();
  }

  @RequirePermission('content')
  @Get('texts/defaults')
  defaultTexts() {
    return this.content.defaultTexts();
  }

  @RequirePermission('content')
  @Put('texts')
  setText(@Body(new ZodPipe(textUpdateSchema)) body: z.infer<typeof textUpdateSchema>) {
    return this.content.setText(body.locale, body.key, body.value);
  }

  @RequirePermission('content')
  @Get('settings')
  settings() {
    return this.content.settings();
  }

  @RequirePermission('content')
  @Put('settings')
  saveSettings(@Body(new ZodPipe(siteSettingsSchema)) body: SiteSettings) {
    return this.content.saveSettings(body);
  }

  @RequirePermission('content')
  @Post('import')
  importFromSite(@Query('force') force?: string) {
    return this.content.importFromSite(force === '1');
  }

  @Get(':collection')
  list(@CurrentUser() user: SessionUser, @Param('collection') collection: string) {
    return this.content.list(collectionFor(user, collection));
  }

  @Post(':collection')
  create(@CurrentUser() user: SessionUser, @Param('collection') collection: string, @Body() body: unknown) {
    const key = collectionFor(user, collection);
    return this.content.create(key, new ZodPipe(itemInputSchema(key)).transform(body));
  }

  @Post(':collection/reorder')
  @HttpCode(204)
  reorder(@CurrentUser() user: SessionUser, @Param('collection') collection: string, @Body(new ZodPipe(reorderSchema)) body: { ids: string[] }) {
    return this.content.reorder(collectionFor(user, collection), body.ids);
  }

  @Patch(':collection/:id')
  update(@CurrentUser() user: SessionUser, @Param('collection') collection: string, @Param('id') id: string, @Body() body: unknown) {
    const key = collectionFor(user, collection);
    return this.content.update(key, id, new ZodPipe(itemInputSchema(key)).transform(body));
  }

  @Delete(':collection/:id')
  @HttpCode(204)
  remove(@CurrentUser() user: SessionUser, @Param('collection') collection: string, @Param('id') id: string) {
    return this.content.remove(collectionFor(user, collection), id);
  }
}
