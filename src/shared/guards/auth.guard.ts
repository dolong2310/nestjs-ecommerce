import { REQUEST_ROLE_PERMISSIONS_KEY, REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { HttpMethodType } from '@/shared/constants/permission.constant';
import { CURRENT_VERSION_PATH } from '@/shared/constants/version.constant';
import { AccessTokenExpiredException, InvalidAccessTokenException } from '@/shared/errors/shared-error.error';
import { extractTokenFromHeader, isJsonWebTokenError, isTokenExpiredError } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { TokenService } from '@/shared/services/token.service';
import { AccessTokenPayload } from '@/shared/types/jwt.type';
import { RoleWithPermissionsType } from '@/shared/types/shared-role.type';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { keyBy } from 'lodash-es';

type Permission = RoleWithPermissionsType['permissions'][number];
type CachedRole = RoleWithPermissionsType & {
  permissionsMap: {
    [key: string]: Permission;
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // console.log('clear cache');
    // this.cacheManager.clear();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // 1. Verify access token
    const decodedAccessToken = await this._verifyAccessToken(request);

    // 2. Check user permission
    await this._checkUserPermission(request, decodedAccessToken); // comment để test public route

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
    const path: string = request.route.path.slice(CURRENT_VERSION_PATH.length);
    const roleId = decodedAccessToken.roleId;
    const cacheKey = `role:${roleId}`;

    // 1. Check if cached role exists
    let cachedRole = await this.cacheManager.get<CachedRole>(cacheKey);

    // 2. If not, get role include permissions
    if (!cachedRole) {
      // 2.1. Get role include permissions
      const roleWithPermissions = await this.prismaService.role.findUnique({
        where: {
          id: roleId,
          isActive: true,
          deletedAt: null,
        },
        include: {
          permissions: {
            where: {
              // before solution: filter theo cặp method và path để tối ưu hơn việc lấy toàn bộ permissions
              // deletedAt: null,
              // method: method,
              // path: path,
              // after solution: lấy toàn bộ permissions => bỏ filter method và path (vì đã cached tất cả permissions trong redis)
              deletedAt: null,
            },
          },
        },
      });

      if (!roleWithPermissions) {
        throw new ForbiddenException();
      }

      // 2.2. Key by method and path (mục đích transform lại thành method:path để dễ dàng check canAccess bằng object)
      const permissionsMap = keyBy(
        roleWithPermissions.permissions,
        (p) => `${p.method}:${p.path}`,
      ) as CachedRole['permissionsMap'];

      // 2.3. Cache role with permissions
      cachedRole = {
        ...roleWithPermissions,
        permissionsMap,
      };

      const ttl = 1000 * 60 * 60; // 1 hour cache (expiration time in milliseconds)
      await this.cacheManager.set(cacheKey, cachedRole, ttl);
    }

    // 3. Check if user has permission to access the route
    const canAccess: Permission | undefined = cachedRole?.permissionsMap[`${method}:${path}`];
    // console.log('canAccess: ', Boolean(canAccess));

    if (!canAccess) {
      throw new ForbiddenException();
    }

    // 4. Set roleWithPermissions to request
    const { permissionsMap, ...roleWithPermissions } = cachedRole; // Omit permissionsMap to avoid circular reference

    request[REQUEST_ROLE_PERMISSIONS_KEY] = roleWithPermissions;
  }
}
