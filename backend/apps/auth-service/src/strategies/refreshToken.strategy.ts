import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '@app/shared';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: JwtPayload) {
        const refreshToken = req.headers.authorization?.replace('Bearer ', '');
        return { ...payload, refreshToken };
    }
}
