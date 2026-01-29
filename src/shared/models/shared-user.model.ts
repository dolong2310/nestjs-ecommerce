import { EnumUserStatus } from "@/shared/constants/auth.constant";
import { PermissionSchema } from "@/shared/models/shared-permission.model";
import { RoleSchema } from "@/shared/models/shared-role.model";
import z from "zod";

// export const UserSchema = z.object({
//   id: z.number(),
//   name: z.string().min(1).max(100),
//   email: z.email(),
//   password: z.string().min(6).max(100),
//   phoneNumber: z.string().min(10).max(15).nullable(),

//   avatar: z.string().nullable(),
//   totpSecret: z.string().nullable(),
//   status: z.enum(EnumUserStatus),
//   roleId: z.number().positive(),

//   createdById: z.number().nullable(),
//   updatedById: z.number().nullable(),

//   deletedAt: z.date().nullable(),
//   createdAt: z.date(),
//   updatedAt: z.date(),
// });

export const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string().max(500),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(10).max(15).nullable(),
  avatar: z.string().max(1000).nullable(),
  totpSecret: z.string().max(1000).nullable(),
  status: z.enum(EnumUserStatus).default(EnumUserStatus.ACTIVE),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

// Response
export const GetUserProfileResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(PermissionSchema.pick({
      id: true,
      name: true,
      path: true,
      method: true,
      module: true,
    })).default([]),
  }),
});

export const UpdateUserProfileResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});
