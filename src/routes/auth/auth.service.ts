import { RolesService } from '@/routes/auth/roles.service';
import { generateOtpCode, isJsonWebTokenError, isNotFoundPrismaError, isTokenExpiredError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { HashingService } from '@/shared/services/hashing.service';
import { TokenService } from '@/shared/services/token.service';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GetMeResponseType, LoginBodyType, LoginResponseType, LogoutBodyType, RefreshJwtTokenBodyType, RefreshJwtTokenResponseType, RegisterBodyType, RegisterResponseType, SendOtpBodyType } from '@/routes/auth/auth.model';
import { AuthRepository } from '@/routes/auth/auth.repo';
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo';
import envConfig from '@/shared/config';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService
  ) { }

  async register(body: RegisterBodyType): Promise<RegisterResponseType> {
    try {
      const userRoleId = await this.rolesService.getUserRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);
      const user = await this.authRepository.createUser({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phoneNumber: body.phoneNumber,
        roleId: userRoleId,
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

  async login(body: LoginBodyType): Promise<LoginResponseType> {
    try {
      const user = await this.authRepository.findUserByEmail(body.email)

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

  async logout(body: LogoutBodyType): Promise<{ message: string }> {
    try {
      // Find refresh token in database
      const refreshToken = await this.authRepository.findRefreshTokenByToken(body.refreshToken);
      // nếu không có refresh token thì return success, vì có đâu mà xoá trong database
      if (!refreshToken) {
        return { message: 'Logout successful' };
      }

      // Delete refresh token from database
      await this.authRepository.deleteRefreshToken(body.refreshToken);

      return { message: 'Logout successful' };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(body: RefreshJwtTokenBodyType): Promise<RefreshJwtTokenResponseType> {
    try {
      // Find refresh token in database
      const refreshToken = await this.authRepository.findRefreshTokenByToken(body.refreshToken);
      if (!refreshToken) {
        throw new NotFoundException([{
          field: 'refreshToken',
          message: 'Refresh token not found',
        }]);
      }

      // Delete refresh token from database
      await this.authRepository.deleteRefreshToken(body.refreshToken);

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

  async getMe(userId: number): Promise<GetMeResponseType> {
    try {
      const user = await this.authRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundException([{
          field: 'userId',
          message: 'User not found',
        }]);
      }

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

  async sendOtp(body: SendOtpBodyType) {
    try {
      // 1. Check email exists in database
      const user = await this.sharedUserRepository.findUnique({ email: body.email });
      if (user) {
        throw new BadRequestException([{
          field: 'email',
          message: 'Email already exists',
        }]);
      }
      // 2. Create verification code
      // 2.1 Generate OTP code
      const otpCode = generateOtpCode();
      // 2.2 Create OTP code in database
      const verificationCode = await this.authRepository.createVerificationCode({
        email: body.email,
        code: otpCode,
        type: body.type,
        expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)), // now + 5 minutes
      });
      // 3. Send OTP to email
      // 4. Return verification code
      return verificationCode;
    } catch (error) {
      throw error;
    }
  }

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
    await this.authRepository.createRefreshToken({
      userId: payload.userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
