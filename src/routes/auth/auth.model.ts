import { UserStatus } from "@/shared/constants/auth.constant";
import z from "zod";

//////////////////////////////////////////
// USER
//////////////////////////////////////////
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(10).max(15),

  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum(UserStatus),
  roleId: z.number().positive(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),

  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserType = z.infer<typeof UserSchema>;

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
// REGISTER
//////////////////////////////////////////
export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
}).extend({
  confirmPassword: z.string().min(6).max(100),
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
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;

export const CreateRefreshTokenBodySchema = RefreshTokenSchema.pick({
  userId: true,
  token: true,
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