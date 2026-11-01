import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { z } from 'zod';
import { RequirePermission } from '../auth/decorators';
import { ZodPipe } from '../common/zod.pipe';
import { MAX_UPLOAD, MediaService } from './media.service';

const altSchema = z.object({ alt: z.string().trim().max(300) });

@RequirePermission('media')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list() {
    return this.media.list();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_UPLOAD, files: 1 } }))
  upload(@UploadedFile() file: Express.Multer.File | undefined) {
    return this.media.upload(file);
  }

  @Patch(':id')
  setAlt(@Param('id') id: string, @Body(new ZodPipe(altSchema)) body: { alt: string }) {
    return this.media.setAlt(id, body.alt);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.media.remove(id);
  }
}
