import z from "zod";

export const EnumHttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().default(''),
  path: z.string().max(1000),
  method: z.enum(EnumHttpMethod),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const PermissionParamsSchema = z.object({
  id: z.coerce.number(),
}).strict();

// For offset-based pagination
export const PermissionQuerySchema = z.object({
  // .int() kiểu integer, .positive() kiểu số dương
  page: z.coerce.number().int().positive().default(1), // coerce: convert string to number because "query" is string by default
  limit: z.coerce.number().int().positive().default(10), // coerce: convert string to number because "query" is string by default
}).strict();
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
}).strict();

export const UpdatePermissionBodySchema = CreatePermissionBodySchema;

// Response
// For offset-based pagination
export const GetPermissionsResponseSchema = z.object({
  data: z.array(PermissionSchema),
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
