import { AuthService } from '@/routes/auth/auth.service';
import { AuthConditionKey, AuthKey, REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { Auth } from '@/shared/decorators/auth.decorator';
import { TokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { RegisterBodyDTO, RegisterResponseDTO } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ZodSerializerDto(RegisterResponseDTO)
  register(@Body() body: RegisterBodyDTO): Promise<any> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: any): Promise<any> {
    return this.authService.login(body);
  }

  @Post('logout')
  logout(@Body() body: any): Promise<any> {
    return this.authService.logout(body);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: any): Promise<any> {
    return this.authService.refreshToken(body);
  }

  @Get('me')
  @Auth([AuthKey.JWT, AuthKey.API_KEY], { condition: AuthConditionKey.AND })
  getMe(@Request() req: Request & { [REQUEST_USER_KEY]: TokenPayload }): Promise<any> {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.authService.getMe(userId);
  }
}
