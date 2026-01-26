import { ForgotPasswordBodyDTO, GetMeResponseDTO, GoogleAuthCallbackQueryDTO, GoogleAuthResponseDTO, LoginBodyDTO, LoginResponseDTO, LogoutBodyDTO, RefreshJwtTokenBodyDTO, RefreshJwtTokenResponseDTO, RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO } from '@/routes/auth/dtos/auth.dto';
import { AuthService } from '@/routes/auth/services/auth.service';
import { GoogleService } from '@/routes/auth/services/google.service';
import envConfig from '@/shared/config';
import { REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { Public } from '@/shared/decorators/auth.decorator';
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
    const { email, password } = body; // be explicit
    return this.authService.login({ email, password, ip, userAgent });
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
  getMe(@Request() req: Request & { [REQUEST_USER_KEY]: AccessTokenPayload }): Promise<GetMeResponseDTO> {
    const userId = req[REQUEST_USER_KEY].userId;
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
}
