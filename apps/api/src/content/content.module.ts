import { Module } from '@nestjs/common';
import { SiteClient } from '../site/site-client.service';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({ controllers: [ContentController], providers: [ContentService, SiteClient], exports: [ContentService, SiteClient] })
export class ContentModule {}
