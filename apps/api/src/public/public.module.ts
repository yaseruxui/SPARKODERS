import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { InboxModule } from '../inbox/inbox.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PublicController } from './public.controller';

@Module({ imports: [InboxModule, ContentModule, NotificationsModule], controllers: [PublicController] })
export class PublicModule {}
