
import { REQUEST_ROLE_PERMISSIONS_KEY, REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { HttpMethodType } from '@/shared/constants/permission.constant';
import { AccessTokenExpiredException, InvalidAccessTokenException } from '@/shared/errors/shared-error.error';
import { extractTokenFromHeader, isJsonWebTokenError, isTokenExpiredError } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { TokenService } from '@/shared/services/token.service';
import { AccessTokenPayload } from '@/shared/types/jwt.type';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // 1. Verify access token
    const decodedAccessToken = await this._verifyAccessToken(request);

    // 2. Check user permission
    await this._checkUserPermission(request, decodedAccessToken);

    // 3. Return true to continue the request
    return true;
  }

  private async _verifyAccessToken(request: Request): Promise<AccessTokenPayload> {
    // 1. Extract token from header
    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    // 2. Verify access token
    try {
      const decoded = await this.tokenService.verifyAccessToken(token);
      if (!decoded) {
        throw new UnauthorizedException();
      }

      // 3. Set user to request
      request[REQUEST_USER_KEY] = decoded;

      // 4. Return decoded
      return decoded;
    } catch (error) {
      // Handle JWT errors
      if (isTokenExpiredError(error)) {
        throw AccessTokenExpiredException;
      }

      if (isJsonWebTokenError(error)) {
        throw InvalidAccessTokenException;
      }
      throw error;
    }
  }

  private async _checkUserPermission(request: Request, decodedAccessToken: AccessTokenPayload): Promise<void> {
    const method = request.method as HttpMethodType;
    const path = request.route.path as string;
    const roleId = decodedAccessToken.roleId;

    // Get role include permissions
    const roleWithPermissions = await this.prismaService.role.findUnique({
      where: {
        id: roleId,
        deletedAt: null,
      },
      include: {
        permissions: {
          where: {
            // filter theo cặp method và path để tối ưu hơn việc lấy toàn bộ permissions
            deletedAt: null,
            method: method,
            path: path,
          }
        }
      }
    });

    if (!roleWithPermissions) {
      throw new ForbiddenException();
    }

    // If permission length > 0 => user can access the route
    const canAccess = roleWithPermissions?.permissions.length > 0;

    if (!canAccess) {
      throw new ForbiddenException();
    }

    // Set role permissions to request
    request[REQUEST_ROLE_PERMISSIONS_KEY] = roleWithPermissions;
  }
}
