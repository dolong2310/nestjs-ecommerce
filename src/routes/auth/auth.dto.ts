import { GetMeResponseSchema, GoogleAuthCallbackQuerySchema, GoogleAuthResponseSchema, LoginBodySchema, LoginResponseSchema, LogoutBodySchema, RefreshJwtTokenBodySchema, RefreshJwtTokenResponseSchema, RegisterBodySchema, RegisterResponseSchema, SendOtpBodySchema } from '@/routes/auth/auth.model';
import { createZodDto } from 'nestjs-zod';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) { }
export class RegisterResponseDTO extends createZodDto(RegisterResponseSchema) { }
export class LoginBodyDTO extends createZodDto(LoginBodySchema) { }
export class LoginResponseDTO extends createZodDto(LoginResponseSchema) { }
export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) { }
export class GetMeResponseDTO extends createZodDto(GetMeResponseSchema) { }
export class RefreshJwtTokenBodyDTO extends createZodDto(RefreshJwtTokenBodySchema) { }
export class RefreshJwtTokenResponseDTO extends createZodDto(RefreshJwtTokenResponseSchema) { }
export class SendOtpBodyDTO extends createZodDto(SendOtpBodySchema) { }
export class GoogleAuthResponseDTO extends createZodDto(GoogleAuthResponseSchema) { }
export class GoogleAuthCallbackQueryDTO extends createZodDto(GoogleAuthCallbackQuerySchema) { }
