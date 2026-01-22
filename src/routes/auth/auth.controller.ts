import { AuthService } from '@/routes/auth/auth.service';
import { AuthConditionKey, AuthKey, REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { Auth } from '@/shared/decorators/auth.decorator';
import { TokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { GetMeResponseDTO, LoginBodyDTO, LoginResponseDTO, LogoutBodyDTO, RefreshJwtTokenBodyDTO, RefreshJwtTokenResponseDTO, RegisterBodyDTO, RegisterResponseDTO } from './auth.dto';

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
  login(@Body() body: LoginBodyDTO): Promise<LoginResponseDTO> {
    return this.authService.login(body);
  }

  @Post('logout')
  logout(@Body() body: LogoutBodyDTO): Promise<{ message: string }> {
    return this.authService.logout(body);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshJwtTokenResponseDTO)
  refreshToken(@Body() body: RefreshJwtTokenBodyDTO): Promise<RefreshJwtTokenResponseDTO> {
    return this.authService.refreshToken(body);
  }

  @Get('me')
  @ZodSerializerDto(GetMeResponseDTO)
  @Auth([AuthKey.JWT, AuthKey.API_KEY], { condition: AuthConditionKey.AND })
  getMe(@Request() req: Request & { [REQUEST_USER_KEY]: TokenPayload }): Promise<GetMeResponseDTO> {
    const userId = req[REQUEST_USER_KEY].userId;
    console.log('User ID: ', userId);
    return this.authService.getMe(userId);
  }
}
