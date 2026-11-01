import { Module } from '@nestjs/common';
import { InboxModule } from '../inbox/inbox.module';
import { DashboardController } from './dashboard.controller';

@Module({ imports: [InboxModule], controllers: [DashboardController] })
export class DashboardModule {}
