import { UserStatus } from '@/generated/prisma/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const RegisterBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
  phoneNumber: z.string().min(10).max(15),
}).strict().superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
  }
});

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) { }

export class RegisterResponseDTO extends createZodDto(UserSchema) { }