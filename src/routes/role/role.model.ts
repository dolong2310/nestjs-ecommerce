import { PaginationQuerySchema } from '@/shared/models/request.model';
import { RoleSchema, RoleWithPermissionsResponseSchema } from '@/shared/models/shared-role.model';
import z from 'zod';

export const RoleParamsSchema = z
  .object({
    id: z.coerce.number(),
  })
  .strict();

// For offset-based pagination
export const RoleQuerySchema = PaginationQuerySchema.strict();
// For cursor-based pagination
// export const RoleQuerySchema = z.object({
//   cursor: z.coerce.number().int().positive().optional(), // ID của record cuối cùng từ page trước
//   limit: z.coerce.number().int().positive().default(10), // Số lượng records cần lấy
// }).strict();

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).strict();

export const UpdateRoleBodySchema = CreateRoleBodySchema.extend({
  permissionIds: z.array(z.number()),
}).strict();

// Response
// For offset-based pagination
export const GetRolesResponseSchema = z.object({
  data: z.array(
    RoleSchema.omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      deletedAt: true,
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});
// For cursor-based pagination
// export const GetRolesResponseSchema = z.object({
//   data: z.array(RoleSchema),
//   nextCursor: z.number().nullable(), // ID của record cuối cùng để dùng cho page tiếp theo
//   hasNextPage: z.boolean(), // Còn page tiếp theo không
//   limit: z.number(),
// });

export const GetRoleResponseSchema = RoleWithPermissionsResponseSchema; // reponse get role detail
