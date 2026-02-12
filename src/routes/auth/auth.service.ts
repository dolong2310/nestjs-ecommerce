import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  ExpiredOtpCodeException,
  FailedToCreateDeviceException,
  FailedToSendOtpCodeException,
  InvalidOtpCodeException,
  InvalidRefreshTokenException,
  InvalidTOTPException,
  InvalidTOTPOrEmailOtpCodeException,
  RefreshTokenExpiredException,
  RefreshTokenHasBeenRevokedException,
  RefreshTokenNotFoundException,
  TOTPAlreadyEnabledException,
  TOTPNotEnabledException,
} from '@/routes/auth/auth.error';
import { AuthRepository } from '@/routes/auth/auth.repo';
import {
  Disable2FABodyType,
  ForgotPasswordBodyType,
  GetMeResponseType,
  JwtTokenType,
  LoginBodyType,
  LoginResponseType,
  LogoutBodyType,
  OtpCodeType,
  RefreshJwtTokenBodyType,
  RefreshJwtTokenResponseType,
  RegisterBodyType,
  RegisterResponseType,
  SendOtpBodyType,
  Setup2FAResponseType,
} from '@/routes/auth/auth.type';
import envConfig from '@/shared/config';
import { EnumOtpCode, EnumOtpCodeType } from '@/shared/constants/auth.constant';
import { RoleNameType } from '@/shared/constants/role.constant';
import { InvalidPasswordException, UserNotFoundException } from '@/shared/errors/shared-error.error';
import {
  generateOtpCode,
  isJsonWebTokenError,
  isNotFoundPrismaError,
  isTokenExpiredError,
  isUniqueConstraintPrismaError,
} from '@/shared/helpers';
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo';
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo';
import { TwoFactorAuthenticationService } from '@/shared/services/2fa.service';
import { EmailService } from '@/shared/services/email.service';
import { HashingService } from '@/shared/services/hashing.service';
import { TokenService } from '@/shared/services/token.service';
import { AccessTokenPayloadCreate } from '@/shared/types/jwt.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { HttpException, Injectable } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';

// TEST BCRYPT HASH & COMPARE (uncomment để test)
// const hashingServiceInstance = new HashingService();
// (async () => {
//   const password = '123123';
//   const hash = await hashingServiceInstance.hash(password);
//   console.log('Password:', password);
//   console.log('Hash:', hash);

//   // Test compare với chính hash vừa tạo
//   const isMatch = await hashingServiceInstance.compare(password, hash);
//   console.log('Compare result:', isMatch); // Phải true

//   // Test với hash khác (hash lại lần 2)
//   const hash2 = await hashingServiceInstance.hash(password);
//   console.log('Hash 2:', hash2);
//   console.log('Hash 1 === Hash 2:', hash === hash2); // Sẽ false

//   // Nhưng compare vẫn true vì bcrypt extract salt từ hash
//   const isMatch2 = await hashingServiceInstance.compare(password, hash2);
//   console.log('Compare with hash2:', isMatch2); // Vẫn true
// })();

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly emailService: EmailService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) {}

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
      const otpCode = await this._findAndValidateOtpCode({
        email: body.email,
        code: body.code,
        type: EnumOtpCode.REGISTER,
      });

      // 2. Create user
      // 2.1 Get user role id
      const userRoleIdPromise = this.sharedRoleRepository.getUserRoleId();
      // 2.2 Hash password
      const hashedPasswordPromise = this.hashingService.hash(body.password);
      // 2.3 Execute promises
      const [userRoleId, hashedPassword] = await Promise.all([userRoleIdPromise, hashedPasswordPromise]);
      // 2.4 Create user
      const createUserPromise = this.authRepository.createUser({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phoneNumber: body.phoneNumber,
        avatar: null,
        roleId: userRoleId,
      });

      // 3. Delete OTP code
      const deleteOtpCodePromise = this.authRepository.deleteOtpCode({ id: otpCode.id });

      // 4. Execute promises
      const [user] = await Promise.all([createUserPromise, deleteOtpCodePromise]);

      // 5. Return user (successfully registered)
      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException;
      }

      throw error;
    }
  }

  async login(body: LoginBodyType & { ip: string; userAgent: string }): Promise<LoginResponseType> {
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

      // 3. Check 2FA is enabled
      if (!!user.totpSecret) {
        // Validate TOTP code or email OTP code
        await this._validateTOTPCodeOrEmailOtpCode({
          totpCode: body.totpCode,
          emailOtpCode: body.emailOtpCode,
          totpSecret: user.totpSecret,
          email: user.email,
          type: EnumOtpCode.LOGIN,
        });
      }

      // 4. Create device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      });

      if (!device) {
        throw FailedToCreateDeviceException;
      }

      // 5. Get role name
      // const role = await this.authRepository.findRoleUnique({ id: user.roleId });

      // if (!role) {
      // throw RoleNotFoundException;
      // }

      // 6. Generate tokens
      const jwtTokens = await this.createAuthTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name as RoleNameType,
      });

      // 7. Return tokens
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
      const updateDevicePromise = this.authRepository.updateDevice(
        { id: refreshToken.deviceId },
        { isActive: false, lastActiveAt: new Date() },
      );

      // 5. Execute promises
      await Promise.all([deleteRefreshTokenPromise, updateDevicePromise]);

      // 6. Return message success
      return { message: 'Success.LogoutSuccessful' };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType): Promise<MessageResponseType> {
    // Forgot Password Form:
    // [email]
    // [code] [button send otp]
    // [new password]
    // [confirm new password]
    // [button submit]
    try {
      // 1. Check OTP code
      const otpCode = await this._findAndValidateOtpCode({
        email: body.email,
        code: body.code,
        type: EnumOtpCode.FORGOT_PASSWORD,
      });

      // 2. Check email exists in database
      const user = await this.sharedUserRepository.findUnique({ email: body.email });

      if (!user) {
        // Delete OTP code
        await this.authRepository.deleteOtpCode({ id: otpCode.id });
        throw EmailNotFoundException;
      }

      // 3. Hash new password
      const hashedPassword = await this.hashingService.hash(body.newPassword);

      // 4. Update user password
      const updateUserPasswordPromise = this.sharedUserRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
          updatedById: user.id,
        },
      );

      // 5. Delete OTP code
      const deleteOtpCodePromise = this.authRepository.deleteOtpCode({ id: otpCode.id });

      // 6. Execute promises
      await Promise.all([updateUserPasswordPromise, deleteOtpCodePromise]);

      // 7. Return message success
      return { message: 'Success.ForgotPasswordSuccessful' };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(
    body: RefreshJwtTokenBodyType & { ip: string; userAgent: string },
  ): Promise<RefreshJwtTokenResponseType> {
    try {
      // 1. Find refresh token in database (includes device, user, role)
      const refreshToken = await this.authRepository.findRefreshTokenUniqueIncludeUserRole({
        token: body.refreshToken,
      });

      if (!refreshToken) {
        throw RefreshTokenNotFoundException;
      }

      const { userId, deviceId, user } = refreshToken;

      // 2. Update device in database
      const updateDevicePromise = this.authRepository.updateDevice(
        { id: deviceId },
        {
          ip: body.ip,
          userAgent: body.userAgent,
        },
      );

      // 3. Check valid refresh token + Decode refresh token get user id
      const verifyRefreshTokenPromise = this.tokenService.verifyRefreshToken(body.refreshToken);

      // 5. Delete refresh token from database
      const deleteRefreshTokenPromise = this.authRepository.deleteRefreshToken({ token: body.refreshToken });

      // 6. Generate new tokens
      const createJwtTokensPromise = this.createAuthTokens({
        userId: userId,
        deviceId: deviceId,
        roleId: user.roleId,
        roleName: user.role.name as RoleNameType,
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
      // 1. Check email exists in database and check type
      const user = await this.sharedUserRepository.findUnique({ email: body.email });

      if (user && body.type === EnumOtpCode.REGISTER) {
        throw EmailAlreadyExistsException;
      }

      if (!user && body.type === EnumOtpCode.FORGOT_PASSWORD) {
        throw EmailNotFoundException;
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
      });

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

  async setup2fa(userId: number): Promise<Setup2FAResponseType> {
    try {
      // 1. Lấy user từ database, kiểm tra user có tồn tại không và kiểm tra đã enable 2FA chưa
      const user = await this.sharedUserRepository.findUnique({ id: userId });

      if (!user) {
        throw UserNotFoundException;
      }

      if (Boolean(user.totpSecret)) {
        throw TOTPAlreadyEnabledException;
      }

      // 2. Tạo secret key và URI cho 2FA
      const { secret, uri } = this.twoFactorAuthenticationService.generateSecret(user.email);

      // 3. Lưu secret key vào database
      await this.sharedUserRepository.update(
        { id: userId },
        {
          totpSecret: secret,
          updatedById: userId,
        },
      );

      // 4. Return secret key và URI
      return {
        secret,
        uri,
      };
    } catch (error) {
      throw error;
    }
  }

  async disable2fa(userId: number, body: Disable2FABodyType): Promise<MessageResponseType> {
    try {
      // 1. Lấy user từ database, kiểm tra user có tồn tại không và kiểm tra đã enable 2FA chưa
      const user = await this.sharedUserRepository.findUnique({ id: userId });

      if (!user) {
        throw UserNotFoundException;
      }

      if (!user.totpSecret) {
        throw TOTPNotEnabledException; // User has not enabled 2FA
      }

      // 2. Validate TOTP code or email OTP code
      await this._validateTOTPCodeOrEmailOtpCode({
        totpCode: body.totpCode,
        emailOtpCode: body.emailOtpCode,
        totpSecret: user.totpSecret,
        email: user.email,
        type: EnumOtpCode.DISABLE_2FA,
      });

      // 3. Delete secret key of user from database
      await this.sharedUserRepository.update(
        { id: userId },
        {
          totpSecret: null,
          updatedById: userId,
        },
      );

      // 4. Return message success
      return { message: 'Success.2FADisabled' };
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

  private async _findAndValidateOtpCode(data: {
    email: string;
    code: string;
    type: EnumOtpCodeType;
  }): Promise<OtpCodeType> {
    try {
      const otpCode = await this.authRepository.findUniqueOtpCode({
        email_type: {
          email: data.email,
          type: data.type,
        },
      });

      if (!otpCode) {
        throw InvalidOtpCodeException;
      }

      if (otpCode.code !== data.code) {
        throw InvalidOtpCodeException;
      }

      if (otpCode.expiresAt < new Date()) {
        // Delete OTP code
        await this.authRepository.deleteOtpCode({ id: otpCode.id });
        throw ExpiredOtpCodeException;
      }

      return otpCode;
    } catch (error) {
      throw error;
    }
  }

  private async _validateTOTPCodeOrEmailOtpCode({
    totpCode,
    emailOtpCode,
    totpSecret,
    email,
    type,
  }: {
    totpCode?: string;
    emailOtpCode?: string;
    totpSecret: string;
    email: string;
    type: EnumOtpCodeType;
  }): Promise<void> {
    try {
      // Check TOTP code is valid or email OTP code is valid
      // 1. Throw error if body does not have totpCode and emailOtpCode
      if (!totpCode && !emailOtpCode) {
        throw InvalidTOTPOrEmailOtpCodeException;
      }

      // 2. Check TOTP code is valid or email OTP code is valid
      if (totpCode) {
        // 2.1 Verify TOTP code
        const isTOTPValid = this.twoFactorAuthenticationService.verifyTOTP({
          email: email,
          secret: totpSecret,
          token: totpCode,
        });

        if (!isTOTPValid) {
          throw InvalidTOTPException;
        }
      } else if (emailOtpCode) {
        // 2.2 Verify email OTP code
        // emailOtpCode là option nếu như user đã enable 2FA bằng TOTP nhưng giả sử không có thiết bị để lấy được TOTP code thì sẽ dùng OTP gửi qua email để login
        // vì vậy không cần check email OTP code mỗi lần login
        const otpCode = await this._findAndValidateOtpCode({
          email: email,
          code: emailOtpCode,
          type: type,
        });
        // 2.3 Delete OTP code
        await this.authRepository.deleteOtpCode({ id: otpCode.id });
      }
    } catch (error) {
      throw error;
    }
  }
}
