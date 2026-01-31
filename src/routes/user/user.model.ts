import { PaginationQuerySchema } from '@/shared/models/request.model';
import { RoleSchema } from '@/shared/models/shared-role.model';
import { GetUserProfileResponseSchema, UserSchema } from '@/shared/models/shared-user.model';
import z from 'zod';

export const UsersResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }),
});

export const UserParamsSchema = z
  .object({
    id: z.coerce.number(),
  })
  .strict();

export const UserQuerySchema = PaginationQuerySchema.strict();

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
  avatar: true,
  roleId: true,
  status: true,
}).strict();

export const UpdateUserBodySchema = CreateUserBodySchema.omit({
  password: true,
}).partial();

// Response
export const GetUsersResponseSchema = z.object({
  data: z.array(UsersResponseSchema),
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});

export const GetUserResponseSchema = GetUserProfileResponseSchema; // get user detail

export const CreateUserResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

// export const CreateUserResponseSchema = GetUserProfileResponseSchema;

export const UpdateUserResponseSchema = CreateUserResponseSchema;
