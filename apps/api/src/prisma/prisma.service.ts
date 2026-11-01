import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { env } from '../config/env';
import { PrismaClient } from '../generated/prisma/client';

/** One Prisma client for the app, over the libSQL (SQLite) driver adapter. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaLibSql({ url: env().DATABASE_URL }) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
