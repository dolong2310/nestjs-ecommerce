import {
  Disable2FABodySchema,
  ForgotPasswordBodySchema,
  GetMeResponseSchema,
  GoogleAuthCallbackQuerySchema,
  GoogleAuthResponseSchema,
  LoginBodySchema,
  LoginResponseSchema,
  LogoutBodySchema,
  RefreshJwtTokenBodySchema,
  RefreshJwtTokenResponseSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOtpBodySchema,
  Setup2FAResponseSchema,
} from '@/routes/auth/models/auth.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class RegisterBodyDTO extends createRequestDto(RegisterBodySchema) {}
export class RegisterResponseDTO extends createResponseDto(RegisterResponseSchema) {}
export class LoginBodyDTO extends createRequestDto(LoginBodySchema) {}
export class LoginResponseDTO extends createResponseDto(LoginResponseSchema) {}
export class LogoutBodyDTO extends createRequestDto(LogoutBodySchema) {}
export class ForgotPasswordBodyDTO extends createRequestDto(ForgotPasswordBodySchema) {}
export class GetMeResponseDTO extends createResponseDto(GetMeResponseSchema) {}
export class RefreshJwtTokenBodyDTO extends createRequestDto(RefreshJwtTokenBodySchema) {}
export class RefreshJwtTokenResponseDTO extends createResponseDto(RefreshJwtTokenResponseSchema) {}
export class SendOtpBodyDTO extends createRequestDto(SendOtpBodySchema) {}
export class GoogleAuthResponseDTO extends createResponseDto(GoogleAuthResponseSchema) {}
export class GoogleAuthCallbackQueryDTO extends createRequestDto(GoogleAuthCallbackQuerySchema) {}
export class Setup2FAResponseDTO extends createResponseDto(Setup2FAResponseSchema) {}
export class Disable2FABodyDTO extends createRequestDto(Disable2FABodySchema) {}
