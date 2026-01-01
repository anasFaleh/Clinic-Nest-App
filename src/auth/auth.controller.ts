import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtGuard, RtGuard } from './guards';
import { GetRefreshToken, GetUser } from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signup(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @UseGuards(RtGuard)
  @Post('Refresh')
  async refreshTokens(
    @GetUser('sub') userId: string,
    @GetRefreshToken() rt: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(rt);
    const tokens = await this.authService.refreshTokens(userId, rt);
    this.setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @UseGuards(JwtGuard)
  @Post('Logout')
  async logout(
    @GetUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token', {
      path: 'auth/Refresh',
      httpOnly: true,
      sameSite: 'strict',
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });
    return { message: 'You logged out successfully' };
  }

  // Helper method to set refresh token cookie
  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: 'auth/Refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
