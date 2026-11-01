import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { type MailSettingsInput, mailSettingsSchema, mailTestSchema } from '@sparkoders/contracts';
import { RequirePermission } from '../auth/decorators';
import { ZodPipe } from '../common/zod.pipe';
import { emailHtml, MailService } from './mail.service';

@RequirePermission('users')
@Controller('settings/mail')
export class MailController {
  constructor(private readonly mail: MailService) {}

  @Get()
  view() {
    return this.mail.view();
  }

  @Put()
  save(@Body(new ZodPipe(mailSettingsSchema)) body: MailSettingsInput) {
    return this.mail.save(body);
  }

  @Post('test')
  @HttpCode(204)
  async test(@Body(new ZodPipe(mailTestSchema)) body: { to: string }) {
    await this.mail.send(
      {
        to: body.to,
        subject: 'رسالة تجربة من لوحة SPARKODERS',
        text: 'إعدادات البريد تعمل.',
        html: emailHtml('إعدادات البريد تعمل', ['هذه رسالة تجربة من لوحة تحكم سبارك كودرز.']),
      },
      true,
    );
  }
}
