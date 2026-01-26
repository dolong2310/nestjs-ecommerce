import { Disable2FABodyDTO, ForgotPasswordBodyDTO, GetMeResponseDTO, GoogleAuthCallbackQueryDTO, GoogleAuthResponseDTO, LoginBodyDTO, LoginResponseDTO, LogoutBodyDTO, RefreshJwtTokenBodyDTO, RefreshJwtTokenResponseDTO, RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO, Setup2FAResponseDTO } from '@/routes/auth/dtos/auth.dto';
import { AuthService } from '@/routes/auth/services/auth.service';
import { GoogleService } from '@/routes/auth/services/google.service';
import envConfig from '@/shared/config';
import { REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { Public } from '@/shared/decorators/auth.decorator';
import { EmptyBodyDTO } from '@/shared/dtos/request.dto';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { AccessTokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Get, Headers, HttpCode, HttpException, HttpStatus, Ip, Post, Query, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) { }

  @Post('register')
  @Public()
  @ZodSerializerDto(RegisterResponseDTO)
  register(@Body() body: RegisterBodyDTO): Promise<RegisterResponseDTO> { // return dto to avoid exposing password and toptSecret
    const { name, email, password, confirmPassword, phoneNumber, code } = body; // be explicit
    return this.authService.register({
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      code,
    });
  }

  @Post('login')
  @Public()
  @ZodSerializerDto(LoginResponseDTO)
  login(@Body() body: LoginBodyDTO, @Ip() ip: string, @Headers('user-agent') userAgent: string): Promise<LoginResponseDTO> {
    const { email, password, totpCode, emailOtpCode } = body; // be explicit
    return this.authService.login({
      email,
      password,
      ip,
      userAgent,
      totpCode,
      emailOtpCode,
    });
  }

  @Post('logout')
  @ZodSerializerDto(MessageResponseDTO)
  logout(@Body() body: LogoutBodyDTO): Promise<MessageResponseDTO> {
    return this.authService.logout({ refreshToken: body.refreshToken });
  }

  @Post('forgot-password')
  @Public()
  @ZodSerializerDto(MessageResponseDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO): Promise<MessageResponseDTO> {
    const { email, code, newPassword, confirmNewPassword } = body; // be explicit
    return this.authService.forgotPassword({
      email,
      code,
      newPassword,
      confirmNewPassword,
    });
  }

  @Post('refresh-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshJwtTokenResponseDTO)
  refreshToken(@Body() body: RefreshJwtTokenBodyDTO, @Ip() ip: string, @Headers('user-agent') userAgent: string): Promise<RefreshJwtTokenResponseDTO> {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, ip, userAgent });
  }

  @Get('me')
  @ZodSerializerDto(GetMeResponseDTO)
  getMe(@ActiveUser('userId') userId: number): Promise<GetMeResponseDTO> {
    return this.authService.getMe(userId);
  }

  @Post('otp')
  @Public()
  @ZodSerializerDto(MessageResponseDTO)
  sendOtp(@Body() body: SendOtpBodyDTO): Promise<MessageResponseDTO> {
    const { email, type } = body; // be explicit
    return this.authService.sendOtp({ email, type });
  }

  @Get('google/url')
  @Public()
  @ZodSerializerDto(GoogleAuthResponseDTO)
  getAuthorizationUrl(@Ip() ip: string, @Headers('user-agent') userAgent: string): GoogleAuthResponseDTO {
    return this.googleService.getAuthorizationUrl({ ip, userAgent });
  }

  @Get('google/callback')
  @Public()
  async authCallback(@Query() query: GoogleAuthCallbackQueryDTO, @Res() response: Response): Promise<void> {
    try {
      const { accessToken, refreshToken } = await this.googleService.authCallback({
        state: query.state,
        code: query.code,
        scope: query.scope,
        authuser: query.authuser,
        prompt: query.prompt,
      });
      return response.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${accessToken}&refreshToken=${refreshToken}`)
    } catch (error) {
      const errorMessage = error instanceof HttpException ? error.message : 'Failed to authenticate with Google';
      return response.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${errorMessage}`)
    }
  }

  // Tại sao không dùng GET mà dùng POST? Khi mà body truyền là {}
  // POST bảo mật hơn GET, vì GET có thể được kích hoạt thông qua URL trên trình duyệt, còn POST thì không thể
  // User phải login thì mới enable 2FA (Authentication Required)
  @Post('2fa/setup')
  @ZodSerializerDto(Setup2FAResponseDTO)
  setup2fa(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number): Promise<Setup2FAResponseDTO> {
    // Không cần truyền body, chỉ cần lấy userId từ decorator
    return this.authService.setup2fa(userId);
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResponseDTO)
  disable2fa(@Body() body: Disable2FABodyDTO, @ActiveUser('userId') userId: number): Promise<MessageResponseDTO> {
    // User phải truyền 1 trong 2 trường totpCode hoặc emailOtpCode thì mới đủ chứng thực để có thể disable 2FA
    // Tránh việc user có quyền tuỳ ý disable 2FA
    return this.authService.disable2fa(userId, {
      totpCode: body.totpCode,
      emailOtpCode: body.emailOtpCode,
    });
  }
}
