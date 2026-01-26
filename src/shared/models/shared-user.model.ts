import { EnumUserStatus } from "@/shared/constants/auth.constant";
import z from "zod";

//////////////////////////////////////////
// USER
//////////////////////////////////////////
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(10).max(15).nullable(),

  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum(EnumUserStatus),
  roleId: z.number().positive(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),

  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserType = z.infer<typeof UserSchema>;