import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import envConfig from '@/shared/config';
import { AccessTokenPayload, AccessTokenPayloadCreate, RefreshTokenPayload, RefreshTokenPayloadCreate } from '@/shared/types/jwt.type';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) { }

  signAccessToken(payload: AccessTokenPayloadCreate): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as StringValue,
      algorithm: 'HS256',
    });
  }

  signRefreshToken(payload: RefreshTokenPayloadCreate): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN as StringValue,
      algorithm: 'HS256',
    });
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync<AccessTokenPayload>(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    });
  }
}
