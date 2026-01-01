import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadInterface } from '../payload.interface';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RTStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.['refresh_token'];
        },
      ]),
      secretOrKey:
        configService.get('JWT_REFRESH_SECRET') || 'JWT_REFRESH_SECRET',
    });
  }

  validate(payload: PayloadInterface) {
    return {
      sub: payload.sub,
      role: payload.role,
    };
  }
}
