
import { REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { extractTokenFromHeader, isJsonWebTokenError, isTokenExpiredError } from '@/shared/helpers';
import { TokenService } from '@/shared/services/token.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = await this.tokenService.verifyAccessToken(token);
      if (!decoded) {
        throw new UnauthorizedException();
      }

      request[REQUEST_USER_KEY] = decoded;

      return true; // return true to continue the request
    } catch (error) {
      // Handle JWT errors
      if (isTokenExpiredError(error)) {
        throw new UnauthorizedException([{
          field: 'accessToken',
          message: 'Access token has expired',
        }]);
      }

      if (isJsonWebTokenError(error)) {
        throw new UnauthorizedException([{
          field: 'accessToken',
          message: 'Invalid access token',
        }]);
      }
      throw error;
    }
  }
}
