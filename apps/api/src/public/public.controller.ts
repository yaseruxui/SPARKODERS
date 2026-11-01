import { Body, Controller, Get, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { type ContactSubmission, contactSubmissionSchema } from '@sparkoders/contracts';
import { timingSafeEqual } from 'node:crypto';
import { Public } from '../auth/decorators';
import { ZodPipe } from '../common/zod.pipe';
import { env } from '../config/env';
import { ContentService } from '../content/content.service';
import { InboxService } from '../inbox/inbox.service';

function sameKey(given: string | undefined, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Endpoints the public site calls from its server (never from the browser). */
@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly inbox: InboxService,
    private readonly content: ContentService,
  ) {}

  /** Edited site content (published items only). The site falls back to its bundled copy for anything absent. */
  @Get('content')
  publicContent() {
    return this.content.publicContent();
  }

  /** The site's contact form: CONTACT_WEBHOOK_URL = {API}/public/contact, header x-contact-key. */
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('contact')
  @HttpCode(201)
  contact(@Headers('x-contact-key') key: string | undefined, @Body(new ZodPipe(contactSubmissionSchema)) body: ContactSubmission) {
    if (!sameKey(key, env().CONTACT_WEBHOOK_KEY)) throw new UnauthorizedException();
    return this.inbox.receive(body);
  }
}
