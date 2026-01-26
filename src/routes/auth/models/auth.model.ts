import { EnumOtpCode } from "@/shared/constants/auth.constant";
import { UserSchema } from "@/shared/models/shared-user.model";
import z from "zod";

//////////////////////////////////////////
// JWT TOKEN
//////////////////////////////////////////
export const JwtTokenSchema = z.object({
  accessToken: z.string().min(1).max(1000),
  refreshToken: z.string().min(1).max(1000),
});

//////////////////////////////////////////
// GET ME
//////////////////////////////////////////
export const GetMeResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

//////////////////////////////////////////
// DEVICE
//////////////////////////////////////////
export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  isActive: z.boolean().default(true),
  lastActiveAt: z.date().default(new Date()),
  createdAt: z.date().default(new Date()),
});

export const CreateDeviceBodySchema = DeviceSchema.pick({
  userId: true,
  userAgent: true,
  ip: true,
  // isActive: true,
  // lastActiveAt: true,
}).strict();

//////////////////////////////////////////
// ROLE
//////////////////////////////////////////
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

//////////////////////////////////////////
// REGISTER
//////////////////////////////////////////
export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
}).extend({
  confirmPassword: z.string().min(6).max(100),
  code: z.string().length(6),
}).strict().superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Error.PasswordNotMatch', // Passwords do not match
      path: ['confirmPassword'],
    });
  }
});

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

//////////////////////////////////////////
// LOGIN
//////////////////////////////////////////
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();

export const LoginResponseSchema = JwtTokenSchema;

//////////////////////////////////////////
// LOGOUT
//////////////////////////////////////////
export const LogoutBodySchema = JwtTokenSchema.pick({
  refreshToken: true,
}).strict();

//////////////////////////////////////////
// FORGOT PASSWORD
//////////////////////////////////////////
export const ForgotPasswordBodySchema = z.object({
  email: z.email(),
  code: z.string().length(6),
  newPassword: z.string().min(6).max(100),
  confirmNewPassword: z.string().min(6).max(100),
}).strict().superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Error.PasswordNotMatch', // Passwords do not match
      path: ['confirmNewPassword'],
    });
  }
});

//////////////////////////////////////////
// REFRESH TOKEN
//////////////////////////////////////////
export const RefreshTokenSchema = z.object({
  token: z.string().min(1).max(1000),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

//////////////////////////////////////////
// CREATE REFRESH TOKEN
//////////////////////////////////////////
export const CreateRefreshTokenBodySchema = RefreshTokenSchema.pick({
  userId: true,
  token: true,
  deviceId: true,
  expiresAt: true,
}).strict();

export const CreateRefreshTokenResponseSchema = RefreshTokenSchema;

//////////////////////////////////////////
// REFRESH JWT TOKEN
//////////////////////////////////////////
export const RefreshJwtTokenBodySchema = JwtTokenSchema.pick({
  refreshToken: true,
}).strict();

export const RefreshJwtTokenResponseSchema = JwtTokenSchema;

//////////////////////////////////////////
// OTP CODE
//////////////////////////////////////////
export const OtpCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().length(6),
  type: z.enum(EnumOtpCode),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const CreateOtpCodeBodySchema = OtpCodeSchema.pick({
  email: true,
  code: true,
  type: true,
  expiresAt: true,
}).strict();

//////////////////////////////////////////
// SEND OTP
//////////////////////////////////////////
export const SendOtpBodySchema = OtpCodeSchema.pick({
  email: true,
  type: true,
}).strict();

//////////////////////////////////////////
// GOOGLE AUTH
//////////////////////////////////////////
export const GoogleAuthStateSchema = DeviceSchema.pick({
  ip: true,
  userAgent: true,
}).strict();

export const GoogleAuthResponseSchema = z.object({
  url: z.url(),
});

export const GoogleAuthCallbackQuerySchema = z.object({
  state: z.string(),
  code: z.string(),
  scope: z.string(),
  authuser: z.string(),
  prompt: z.string(),
});

export const GoogleAuthCallbackResponseSchema = JwtTokenSchema;
