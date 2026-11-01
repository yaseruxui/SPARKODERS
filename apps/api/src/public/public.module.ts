import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { InboxModule } from '../inbox/inbox.module';
import { PublicController } from './public.controller';

@Module({ imports: [InboxModule, ContentModule], controllers: [PublicController] })
export class PublicModule {}
