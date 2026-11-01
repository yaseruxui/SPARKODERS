import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { itemInputSchema, reorderSchema, type SiteSettings, siteSettingsSchema, textUpdateSchema } from '@sparkoders/contracts';
import type { z } from 'zod';
import { RequirePermission } from '../auth/decorators';
import { ZodPipe } from '../common/zod.pipe';
import { ContentService, isCollection } from './content.service';

function collectionOr404(value: string) {
  if (!isCollection(value)) throw new NotFoundException();
  return value;
}

@RequirePermission('content')
@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('texts')
  texts() {
    return this.content.texts();
  }

  @Get('texts/defaults')
  defaultTexts() {
    return this.content.defaultTexts();
  }

  @Put('texts')
  setText(@Body(new ZodPipe(textUpdateSchema)) body: z.infer<typeof textUpdateSchema>) {
    return this.content.setText(body.locale, body.key, body.value);
  }

  @Get('settings')
  settings() {
    return this.content.settings();
  }

  @Put('settings')
  saveSettings(@Body(new ZodPipe(siteSettingsSchema)) body: SiteSettings) {
    return this.content.saveSettings(body);
  }

  @Post('import')
  importFromSite(@Query('force') force?: string) {
    return this.content.importFromSite(force === '1');
  }

  @Get(':collection')
  list(@Param('collection') collection: string) {
    return this.content.list(collectionOr404(collection));
  }

  @Post(':collection')
  create(@Param('collection') collection: string, @Body() body: unknown) {
    const key = collectionOr404(collection);
    return this.content.create(key, new ZodPipe(itemInputSchema(key)).transform(body));
  }

  @Post(':collection/reorder')
  @HttpCode(204)
  reorder(@Param('collection') collection: string, @Body(new ZodPipe(reorderSchema)) body: { ids: string[] }) {
    return this.content.reorder(collectionOr404(collection), body.ids);
  }

  @Patch(':collection/:id')
  update(@Param('collection') collection: string, @Param('id') id: string, @Body() body: unknown) {
    const key = collectionOr404(collection);
    return this.content.update(key, id, new ZodPipe(itemInputSchema(key)).transform(body));
  }

  @Delete(':collection/:id')
  @HttpCode(204)
  remove(@Param('collection') collection: string, @Param('id') id: string) {
    return this.content.remove(collectionOr404(collection), id);
  }
}
