import { GetMeResponseDTO, LoginBodyDTO, LoginResponseDTO, LogoutBodyDTO, RefreshJwtTokenBodyDTO, RefreshJwtTokenResponseDTO, RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO } from '@/routes/auth/auth.dto';
import { AuthService } from '@/routes/auth/auth.service';
import { AuthConditionKey, AuthKey, REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { Auth } from '@/shared/decorators/auth.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { AccessTokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Request } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ZodSerializerDto(RegisterResponseDTO)
  register(@Body() body: RegisterBodyDTO): Promise<RegisterResponseDTO> { // return dto to avoid exposing password and toptSecret
    const { name, email, password, confirmPassword, phoneNumber, code } = body; // be explicit
    return this.authService.register({ name, email, password, confirmPassword, phoneNumber, code });
  }

  @Post('login')
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

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshJwtTokenResponseDTO)
  refreshToken(@Body() body: RefreshJwtTokenBodyDTO, @Ip() ip: string, @Headers('user-agent') userAgent: string): Promise<RefreshJwtTokenResponseDTO> {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, ip, userAgent });
  }

  @Get('me')
  @ZodSerializerDto(GetMeResponseDTO)
  @Auth([AuthKey.JWT, AuthKey.API_KEY], { condition: AuthConditionKey.AND })
  getMe(@Request() req: Request & { [REQUEST_USER_KEY]: AccessTokenPayload }): Promise<GetMeResponseDTO> {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.authService.getMe(userId);
  }

  @Post('otp')
  @ZodSerializerDto(MessageResponseDTO)
  sendOtp(@Body() body: SendOtpBodyDTO): Promise<MessageResponseDTO> {
    const { email, type } = body; // be explicit
    return this.authService.sendOtp({ email, type });
  }
}
