import {
  CreatePermissionBodySchema,
  GetPermissionResponseSchema,
  GetPermissionsResponseSchema,
  PermissionParamsSchema,
  PermissionQuerySchema,
  UpdatePermissionBodySchema,
} from '@/routes/permission/permission.model';
import z from 'zod';

export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;
export type PermissionParamsType = z.infer<typeof PermissionParamsSchema>;
export type PermissionQueryType = z.infer<typeof PermissionQuerySchema>;
export type GetPermissionsResponseType = z.infer<typeof GetPermissionsResponseSchema>;
export type GetPermissionResponseType = z.infer<typeof GetPermissionResponseSchema>;
