import { AuthRepository } from '@/routes/auth/auth.repo';
import { GetMeResponseType, JwtTokenType, LoginBodyType, LoginResponseType, LogoutBodyType, RefreshJwtTokenBodyType, RefreshJwtTokenResponseType, RegisterBodyType, RegisterResponseType, SendOtpBodyType } from '@/routes/auth/auth.type';
import { RolesService } from '@/routes/auth/roles.service';
import envConfig from '@/shared/config';
import { EnumVerificationCode } from '@/shared/constants/auth.constant';
import { generateOtpCode, isJsonWebTokenError, isNotFoundPrismaError, isTokenExpiredError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo';
import { EmailService } from '@/shared/services/email.service';
import { HashingService } from '@/shared/services/hashing.service';
import { TokenService } from '@/shared/services/token.service';
import { AccessTokenPayloadCreate } from '@/shared/types/jwt.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { BadRequestException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly emailService: EmailService,
  ) { }

  async register(body: RegisterBodyType): Promise<RegisterResponseType> {
    // flow register:
    // 1. User input form email, password, confirm password, phone number
    // 2. Click button "Send OTP code" -> send OTP code to email
    // 3. User input OTP code
    // 4. Click button "Register" with additional OTP code
    // 5. Check OTP code
    // 6. Create user
    // 7. Delete OTP code
    // 8. Return user (successfully registered)
    try {
      // 1. Check OTP code
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: EnumVerificationCode.REGISTER,
      });

      if (!verificationCode) {
        throw new BadRequestException([{
          field: 'code',
          message: 'Invalid OTP code',
        }]);
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new BadRequestException([{
          field: 'code',
          message: 'OTP code has expired',
        }]);
      }

      // 2. Create user
      // 2.1 Get user role id
      const userRoleIdPromise = this.rolesService.getUserRoleId();
      // 2.2 Hash password
      const hashedPasswordPromise = this.hashingService.hash(body.password);
      // 2.3 Execute promises
      const [userRoleId, hashedPassword] = await Promise.all([userRoleIdPromise, hashedPasswordPromise]);
      // 2.4 Create user
      const user = await this.authRepository.createUser({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phoneNumber: body.phoneNumber,
        roleId: userRoleId,
      });

      // 3. Delete OTP code
      await this.authRepository.deleteVerificationCode({ id: verificationCode.id });

      // 4. Return user (successfully registered)
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

  async login(body: LoginBodyType & { ip: string, userAgent: string }): Promise<LoginResponseType> {
    try {
      // 1. Check email exists in database
      const user = await this.authRepository.findUserUniqueIncludeRole({ email: body.email });
      // const user = await this.sharedUserRepository.findUnique({ email: body.email });

      if (!user) {
        throw new NotFoundException([{
          field: 'email',
          message: 'Email not found',
        }]);
      }

      // 2. Check password is correct
      const comparePassword = await this.hashingService.compare(body.password, user.password);

      if (!comparePassword) {
        throw new BadRequestException([{
          field: 'password',
          message: 'Invalid password',
        }]);
      }

      // 3. Create device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      });

      if (!device) {
        throw new BadRequestException([{
          field: 'device',
          message: 'Failed to create device',
        }]);
      }

      // 4. Get role name
      // const role = await this.authRepository.findRoleUnique({ id: user.roleId });

      // if (!role) {
      //   throw new NotFoundException([{
      //     field: 'role',
      //     message: 'Role not found',
      //   }]);
      // }

      // 5. Generate tokens
      const tokens = await this._generateTokens({ userId: user.id, deviceId: device.id, roleId: user.roleId, roleName: user.role.name });

      // 6. Return tokens
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async logout(body: LogoutBodyType): Promise<MessageResponseType> {
    try {
      // 1. Find refresh token in database
      const refreshToken = await this.authRepository.findRefreshTokenUnique({ token: body.refreshToken });

      // 2. Nếu không có refresh token thì return success, vì có đâu mà xoá trong database
      if (!refreshToken) {
        return { message: 'Logout successful' };
      }

      // 3. Delete refresh token from database
      const deleteRefreshTokenPromise = this.authRepository.deleteRefreshToken({ token: body.refreshToken });

      // 4. Update device isActive to false (device has been logged out) in database
      const updateDevicePromise = this.authRepository.updateDevice(refreshToken.deviceId, { isActive: false, lastActiveAt: new Date() });

      // 5. Execute promises
      await Promise.all([deleteRefreshTokenPromise, updateDevicePromise]);

      // 6. Return message success
      return { message: 'Logout successful' };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(body: RefreshJwtTokenBodyType & { ip: string, userAgent: string }): Promise<RefreshJwtTokenResponseType> {
    try {
      // 1. Find refresh token in database (includes device, user, role)
      const refreshToken = await this.authRepository.findRefreshTokenUniqueIncludeUserRole({ token: body.refreshToken });

      if (!refreshToken) {
        throw new NotFoundException([{
          field: 'refreshToken',
          message: 'Refresh token not found',
        }]);
      }

      const { userId, deviceId, user } = refreshToken;

      // 2. Update device in database
      const updateDevicePromise = this.authRepository.updateDevice(deviceId, {
        ip: body.ip,
        userAgent: body.userAgent,
      });

      // 3. Check valid refresh token + Decode refresh token get user id
      const verifyRefreshTokenPromise = this.tokenService.verifyRefreshToken(body.refreshToken);

      // 5. Delete refresh token from database
      const deleteRefreshTokenPromise = this.authRepository.deleteRefreshToken({ token: body.refreshToken });

      // 6. Generate new tokens
      const newTokensPromise = this._generateTokens({ userId: userId, deviceId: deviceId, roleId: user.roleId, roleName: user.role.name });

      // 7. Execute promises
      const [tokens] = await Promise.all([newTokensPromise, updateDevicePromise, verifyRefreshTokenPromise, deleteRefreshTokenPromise]);

      // 8. Return tokens
      return tokens;
    } catch (error) {
      // HttpException: Nếu throw error ở trong try {} thì chỗ này không cần custom throw error nữa mà throw trực tiếp luôn
      if (error instanceof HttpException) {
        throw error;
      }

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
      // TODO: omit password and totpSecret in type
      const user = await this.sharedUserRepository.findUnique({ id: userId });

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
      const verificationCodePromise = this.authRepository.createVerificationCode({
        email: body.email,
        code: otpCode,
        type: body.type,
        expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)), // now + 5 minutes
      });

      // 3. Send OTP to email
      const sendOtpPromise = this.emailService.sendOtp({
        code: otpCode,
        to: body.email,
        subject: 'OTP Code',
      })

      // 4. Execute promises
      const [verificationCode, { error: emailError }] = await Promise.all([verificationCodePromise, sendOtpPromise]);

      if (emailError) {
        // Delete OTP code
        await this.authRepository.deleteVerificationCode({ id: verificationCode.id });
        throw new BadRequestException([{
          field: 'code',
          message: 'Failed to send OTP code',
        }]);
      }

      // 5. Return verification code (omit code, because user must get code from email)
      return verificationCode;
    } catch (error) {
      throw error;
    }
  }

  private async _generateTokens(payload: AccessTokenPayloadCreate): Promise<JwtTokenType> {
    const { userId, deviceId, roleId, roleName } = payload;

    // 1. Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId, deviceId, roleId, roleName }),
      this.tokenService.signRefreshToken({ userId }),
    ]);

    // 2. Verify refresh token
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    const expiresAt = new Date(decodedRefreshToken.exp * 1000);

    // 3. Save refresh token to database
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      deviceId,
      expiresAt,
    });

    // 4. Return tokens
    return { accessToken, refreshToken };
  }
}
