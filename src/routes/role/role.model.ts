import { PermissionSchema } from "@/shared/models/shared-permission.model";
import { RoleSchema } from "@/shared/models/shared-role.model";
import z from "zod";

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export const RoleParamsSchema = z.object({
  id: z.coerce.number(),
}).strict();

// For offset-based pagination
export const RoleQuerySchema = z.object({
  // .int() kiểu integer, .positive() kiểu số dương
  page: z.coerce.number().int().positive().default(1), // coerce: convert string to number because "query" is string by default
  limit: z.coerce.number().int().positive().default(10), // coerce: convert string to number because "query" is string by default
}).strict();
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
  data: z.array(RoleSchema),
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

export const GetRoleResponseSchema = RoleWithPermissionsSchema; // reponse get role detail
