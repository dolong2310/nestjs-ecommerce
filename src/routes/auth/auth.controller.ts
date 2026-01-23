import { GetMeResponseDTO, LoginBodyDTO, LoginResponseDTO, LogoutBodyDTO, RefreshJwtTokenBodyDTO, RefreshJwtTokenResponseDTO, RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO } from '@/routes/auth/auth.dto';
import { AuthService } from '@/routes/auth/auth.service';
import { AuthConditionKey, AuthKey, REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { Auth } from '@/shared/decorators/auth.decorator';
import { AccessTokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Request } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ZodSerializerDto(RegisterResponseDTO)
  register(@Body() body: RegisterBodyDTO): Promise<RegisterResponseDTO> { // return dto to avoid exposing password and toptSecret
    return this.authService.register(body);
  }

  @Post('login')
  @ZodSerializerDto(LoginResponseDTO)
  login(@Body() body: LoginBodyDTO, @Ip() ip: string, @Headers('user-agent') userAgent: string): Promise<LoginResponseDTO> {
    return this.authService.login({ ...body, ip, userAgent });
  }

  @Post('logout')
  logout(@Body() body: LogoutBodyDTO): Promise<{ message: string }> {
    return this.authService.logout(body);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshJwtTokenResponseDTO)
  refreshToken(@Body() body: RefreshJwtTokenBodyDTO, @Ip() ip: string, @Headers('user-agent') userAgent: string): Promise<RefreshJwtTokenResponseDTO> {
    return this.authService.refreshToken({ ...body, ip, userAgent });
  }

  @Get('me')
  @ZodSerializerDto(GetMeResponseDTO)
  @Auth([AuthKey.JWT, AuthKey.API_KEY], { condition: AuthConditionKey.AND })
  getMe(@Request() req: Request & { [REQUEST_USER_KEY]: AccessTokenPayload }): Promise<GetMeResponseDTO> {
    const userId = req[REQUEST_USER_KEY].userId;
    console.log('User ID: ', userId);
    return this.authService.getMe(userId);
  }

  @Post('otp')
  sendOtp(@Body() body: SendOtpBodyDTO) {
    return this.authService.sendOtp(body);
  }
}
