import { Module } from '@nestjs/common';
import { InboxModule } from '../inbox/inbox.module';
import { PublicController } from './public.controller';

@Module({ imports: [InboxModule], controllers: [PublicController] })
export class PublicModule {}
