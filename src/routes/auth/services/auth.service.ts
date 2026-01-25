import { AuthRepository } from '@/routes/auth/repositories/auth.repo';
import { GetMeResponseType, JwtTokenType, LoginBodyType, LoginResponseType, LogoutBodyType, RefreshJwtTokenBodyType, RefreshJwtTokenResponseType, RegisterBodyType, RegisterResponseType, SendOtpBodyType } from '@/routes/auth/types/auth.type';
import { EmailAlreadyExistsException, EmailNotFoundException, ExpiredOtpCodeException, FailedToCreateDeviceException, FailedToSendOtpCodeException, InvalidOtpCodeException, InvalidPasswordException, InvalidRefreshTokenException, RefreshTokenExpiredException, RefreshTokenHasBeenRevokedException, RefreshTokenNotFoundException, UserNotFoundException } from '@/routes/auth/models/error.model';
import { RolesService } from '@/routes/auth/services/roles.service';
import envConfig from '@/shared/config';
import { EnumOtpCode } from '@/shared/constants/auth.constant';
import { generateOtpCode, isJsonWebTokenError, isNotFoundPrismaError, isTokenExpiredError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo';
import { EmailService } from '@/shared/services/email.service';
import { HashingService } from '@/shared/services/hashing.service';
import { TokenService } from '@/shared/services/token.service';
import { AccessTokenPayloadCreate } from '@/shared/types/jwt.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { HttpException, Injectable } from '@nestjs/common';
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
      const otpCode = await this.authRepository.findUniqueOtpCode({
        email: body.email,
        code: body.code,
        type: EnumOtpCode.REGISTER,
      });

      if (!otpCode) {
        throw InvalidOtpCodeException;
      }

      if (otpCode.expiresAt < new Date()) {
        throw ExpiredOtpCodeException;
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
        avatar: null,
        roleId: userRoleId,
      });

      // 3. Delete OTP code
      await this.authRepository.deleteOtpCode({ id: otpCode.id });

      // 4. Return user (successfully registered)
      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException;
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
        throw EmailNotFoundException;
      }

      // 2. Check password is correct
      const comparePassword = await this.hashingService.compare(body.password, user.password);

      if (!comparePassword) {
        throw InvalidPasswordException;
      }

      // 3. Create device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      });

      if (!device) {
        throw FailedToCreateDeviceException;
      }

      // 4. Get role name
      // const role = await this.authRepository.findRoleUnique({ id: user.roleId });

      // if (!role) {
      // throw RoleNotFoundException;
      // }

      // 5. Generate tokens
      const jwtTokens = await this.createAuthTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      });

      // 6. Return tokens
      return jwtTokens;
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
        return { message: 'Success.LogoutSuccessful' };
      }

      // 3. Delete refresh token from database
      const deleteRefreshTokenPromise = this.authRepository.deleteRefreshToken({ token: body.refreshToken });

      // 4. Update device isActive to false (device has been logged out) in database
      const updateDevicePromise = this.authRepository.updateDevice(refreshToken.deviceId, { isActive: false, lastActiveAt: new Date() });

      // 5. Execute promises
      await Promise.all([deleteRefreshTokenPromise, updateDevicePromise]);

      // 6. Return message success
      return { message: 'Success.LogoutSuccessful' };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(body: RefreshJwtTokenBodyType & { ip: string, userAgent: string }): Promise<RefreshJwtTokenResponseType> {
    try {
      // 1. Find refresh token in database (includes device, user, role)
      const refreshToken = await this.authRepository.findRefreshTokenUniqueIncludeUserRole({ token: body.refreshToken });

      if (!refreshToken) {
        throw RefreshTokenNotFoundException;
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
      const createJwtTokensPromise = this.createAuthTokens({
        userId: userId,
        deviceId: deviceId,
        roleId: user.roleId,
        roleName: user.role.name,
      });

      // 7. Execute promises
      const [jwtTokens] = await Promise.all([
        createJwtTokensPromise,
        updateDevicePromise,
        verifyRefreshTokenPromise,
        deleteRefreshTokenPromise,
      ]);

      // 8. Return tokens
      return jwtTokens;
    } catch (error) {
      // HttpException: Nếu throw error ở trong try {} thì chỗ này không cần custom throw error nữa mà throw trực tiếp luôn
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle JWT errors
      if (isTokenExpiredError(error)) {
        throw RefreshTokenExpiredException;
      }

      if (isJsonWebTokenError(error)) {
        throw InvalidRefreshTokenException;
      }

      // Handle Prisma errors
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenHasBeenRevokedException;
      }

      throw error;
    }
  }

  async getMe(userId: number): Promise<GetMeResponseType> {
    try {
      // TODO: omit password and totpSecret in type
      const user = await this.sharedUserRepository.findUnique({ id: userId });

      if (!user) {
        throw UserNotFoundException;
      }

      return user;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserNotFoundException;
      }

      throw error;
    }
  }

  async sendOtp(body: SendOtpBodyType): Promise<MessageResponseType> {
    try {
      // 1. Check email exists in database
      const user = await this.sharedUserRepository.findUnique({ email: body.email });

      if (user) {
        throw EmailAlreadyExistsException;
      }

      // 2. Create otp code
      // 2.1 Generate OTP code
      const generatedOtpCode = generateOtpCode();

      // 2.2 Create OTP code in database
      const otpCodePromise = this.authRepository.createOtpCode({
        email: body.email,
        code: generatedOtpCode,
        type: body.type,
        expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)), // now + 5 minutes
      });

      // 3. Send OTP to email
      const sendOtpPromise = this.emailService.sendOtp({
        code: generatedOtpCode,
        to: body.email,
        subject: 'OTP Code',
      })

      // 4. Execute promises
      const [otpCode, { error: emailError }] = await Promise.all([otpCodePromise, sendOtpPromise]);

      if (emailError) {
        // Delete OTP code
        await this.authRepository.deleteOtpCode({ id: otpCode.id });
        throw FailedToSendOtpCodeException;
      }

      // 5. Do not return otp code, because user must get code from email
      // message: OTP code has been sent to email
      return { message: 'Success.OtpCodeSentToEmail' };
    } catch (error) {
      throw error;
    }
  }

  public async createAuthTokens(payload: AccessTokenPayloadCreate): Promise<JwtTokenType> {
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
