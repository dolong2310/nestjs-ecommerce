import { EnumVerificationCode } from "@/shared/constants/auth.constant";
import { UserSchema } from "@/shared/models/shared-user.model";
import z from "zod";

//////////////////////////////////////////
// JWT TOKEN
//////////////////////////////////////////
export const JwtTokenSchema = z.object({
  accessToken: z.string().min(1).max(1000),
  refreshToken: z.string().min(1).max(1000),
});

export type JwtTokenType = z.infer<typeof JwtTokenSchema>;

//////////////////////////////////////////
// GET ME
//////////////////////////////////////////
export const GetMeResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type GetMeResponseType = z.infer<typeof GetMeResponseSchema>;

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

export type DeviceType = z.infer<typeof DeviceSchema>;

export const CreateDeviceBodySchema = DeviceSchema.pick({
  userId: true,
  userAgent: true,
  ip: true,
  // isActive: true,
  // lastActiveAt: true,
}).strict();

export type CreateDeviceBodyType = z.infer<typeof CreateDeviceBodySchema> & Partial<Pick<DeviceType, 'isActive' | 'lastActiveAt'>>;

//////////////////////////////////////////
// ROLE
//////////////////////////////////////////
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdById: z.number().optional(),
  updatedById: z.number().optional(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type RoleType = z.infer<typeof RoleSchema>;

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
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
  }
});

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;

//////////////////////////////////////////
// LOGIN
//////////////////////////////////////////
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();

export type LoginBodyType = z.infer<typeof LoginBodySchema>;

export const LoginResponseSchema = JwtTokenSchema;

export type LoginResponseType = z.infer<typeof LoginResponseSchema>;

//////////////////////////////////////////
// LOGOUT
//////////////////////////////////////////
export const LogoutBodySchema = JwtTokenSchema.pick({
  refreshToken: true,
}).strict();

export type LogoutBodyType = z.infer<typeof LogoutBodySchema>;

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

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;

export const CreateRefreshTokenBodySchema = RefreshTokenSchema.pick({
  userId: true,
  token: true,
  deviceId: true,
  expiresAt: true,
}).strict();

export type CreateRefreshTokenBodyType = z.infer<typeof CreateRefreshTokenBodySchema>;

export const CreateRefreshTokenResponseSchema = RefreshTokenSchema;

export type CreateRefreshTokenResponseType = z.infer<typeof CreateRefreshTokenResponseSchema>;

export const RefreshJwtTokenBodySchema = JwtTokenSchema.pick({
  refreshToken: true,
}).strict();

export type RefreshJwtTokenBodyType = z.infer<typeof RefreshJwtTokenBodySchema>;

export const RefreshJwtTokenResponseSchema = JwtTokenSchema;

export type RefreshJwtTokenResponseType = z.infer<typeof RefreshJwtTokenResponseSchema>;

//////////////////////////////////////////
// VERIFICATION CODE
//////////////////////////////////////////
export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().length(6),
  type: z.enum(EnumVerificationCode),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;

export const CreateVerificationCodeBodySchema = VerificationCodeSchema.pick({
  email: true,
  code: true,
  type: true,
  expiresAt: true,
}).strict();

export type CreateVerificationCodeBodyType = z.infer<typeof CreateVerificationCodeBodySchema>;

//////////////////////////////////////////
// SEND OTP
//////////////////////////////////////////
export const SendOtpBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;
