import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  acceptInvitationSchema,
  changePasswordSchema,
  type LoginInput,
  loginSchema,
  type SessionUser,
  updateProfileSchema,
} from '@sparkoders/contracts';
import type { Response } from 'express';
import type { z } from 'zod';
import { ZodPipe } from '../common/zod.pipe';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService, toSessionUser } from './auth.service';
import { CurrentUser, Public } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  /** Five attempts a minute per client. */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodPipe(loginSchema)) body: LoginInput, @Res({ passthrough: true }) res: Response) {
    return this.auth.login(body.email, body.password, res);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    this.auth.clearSession(res);
  }

  @Get('me')
  me(@CurrentUser() user: SessionUser) {
    return user;
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: SessionUser, @Body(new ZodPipe(updateProfileSchema)) body: { name: string }) {
    return toSessionUser(await this.prisma.user.update({ where: { id: user.id }, data: { name: body.name } }));
  }

  @Put('me/password')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() user: SessionUser,
    @Body(new ZodPipe(changePasswordSchema)) body: z.infer<typeof changePasswordSchema>,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.changePassword(user.id, body.currentPassword, body.password, res);
  }

  @Public()
  @Get('invitation/:token')
  invitation(@Param('token') token: string) {
    return this.auth.invitation(token);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('invitation')
  @HttpCode(200)
  accept(
    @Body(new ZodPipe(acceptInvitationSchema)) body: z.infer<typeof acceptInvitationSchema>,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.acceptInvitation(body.token, body.password, res);
  }
}
