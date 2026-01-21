import { RolesService } from '@/routes/auth/roles.service';
import { isJsonWebTokenError, isNotFoundPrismaError, isTokenExpiredError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { HashingService } from '@/shared/services/hashing.service';
import { PrismaService } from '@/shared/services/prisma.service';
import { TokenService } from '@/shared/services/token.service';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterBodyDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService
  ) { }

  private async _generateTokens(payload: { userId: number }) {
    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);
    // Verify refresh token
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    const expiresAt = new Date(decodedRefreshToken.exp * 1000);
    // Save refresh token to database
    await this.prismaService.refreshToken.create({
      data: {
        userId: payload.userId,
        token: refreshToken,
        expiresAt,
      }
    });

    return { accessToken, refreshToken };
  }

  async register(body: RegisterBodyDTO): Promise<any> {
    try {
      const userRoleId = await this.rolesService.getUserRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);
      const user = await this.prismaService.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          phoneNumber: body.phoneNumber,
          roleId: userRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        }
      });

      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException([{
          field: 'email',
          message: 'Email already exists',
        }]);
      }

      throw error;
    }
  }

  async login(body: any): Promise<any> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: body.email,
        },
      })

      if (!user) {
        throw new NotFoundException([{
          field: 'email',
          message: 'Email not found',
        }]);
      }

      const comparePassword = await this.hashingService.compare(body.password, user.password);

      if (!comparePassword) {
        throw new BadRequestException([{
          field: 'password',
          message: 'Invalid password',
        }]);
      }

      const tokens = await this._generateTokens({ userId: user.id });

      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async logout(body: any): Promise<any> {
    try {
      // Find refresh token in database
      const refreshToken = await this.prismaService.refreshToken.findUnique({
        where: {
          token: body.refreshToken,
        },
      });

      // nếu không có refresh token thì return success, vì có đâu mà xoá trong database
      if (!refreshToken) {
        return {
          message: 'Logout successful',
        };
      }

      // Delete refresh token from database
      await this.prismaService.refreshToken.delete({
        where: {
          token: body.refreshToken,
        },
      });

      return {
        message: 'Logout successful',
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(body: any): Promise<any> {
    try {
      // Find refresh token in database
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: body.refreshToken,
        },
      });

      // Delete refresh token from database
      await this.prismaService.refreshToken.delete({
        where: {
          token: body.refreshToken,
        },
      });

      // Decode refresh token get user id
      const decodedRefreshToken = await this.tokenService.verifyRefreshToken(body.refreshToken);

      // Generate new tokens
      const tokens = await this._generateTokens({ userId: decodedRefreshToken.userId });

      return tokens;
    } catch (error) {
      // Handle JWT errors
      if (isTokenExpiredError(error)) {
        throw new UnauthorizedException([{
          field: 'refreshToken',
          message: 'Refresh token has expired',
        }]);
      }

      if (isJsonWebTokenError(error)) {
        throw new UnauthorizedException([{
          field: 'refreshToken',
          message: 'Invalid refresh token',
        }]);
      }

      // Handle Prisma errors
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException([{
          field: 'refreshToken',
          message: 'Refresh token has been revoked',
        }]);
      }

      throw error;
    }
  }

  async getMe(userId: number): Promise<any> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        omit: {
          password: true,
        },
      });

      return user;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException([{
          field: 'userId',
          message: 'User not found',
        }]);
      }

      throw error;
    }
  }
}
