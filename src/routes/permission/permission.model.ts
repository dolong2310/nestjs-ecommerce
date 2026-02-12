import { PaginationQuerySchema } from '@/shared/models/request.model';
import { PermissionSchema } from '@/shared/models/shared-permission.model';
import z from 'zod';

export const PermissionParamsSchema = z
  .object({
    id: z.coerce.number(),
  })
  .strict();

// For offset-based pagination
export const PermissionQuerySchema = PaginationQuerySchema.strict();
// For cursor-based pagination
// export const PermissionQuerySchema = z.object({
//   cursor: z.coerce.number().int().positive().optional(), // ID của record cuối cùng từ page trước
//   limit: z.coerce.number().int().positive().default(10), // Số lượng records cần lấy
// }).strict();

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
  module: true,
}).strict();

export const UpdatePermissionBodySchema = CreatePermissionBodySchema.strict();

// Response
// For offset-based pagination
export const GetPermissionsResponseSchema = z.object({
  data: z.array(
    PermissionSchema.omit({
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
// export const GetPermissionsResponseSchema = z.object({
//   data: z.array(PermissionSchema),
//   nextCursor: z.number().nullable(), // ID của record cuối cùng để dùng cho page tiếp theo
//   hasNextPage: z.boolean(), // Còn page tiếp theo không
//   limit: z.number(),
// });

export const GetPermissionResponseSchema = PermissionSchema.omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
});
