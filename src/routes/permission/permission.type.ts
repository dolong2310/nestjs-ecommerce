import { CreatePermissionBodySchema, GetPermissionsResponseSchema, PermissionParamsSchema, PermissionQuerySchema, UpdatePermissionBodySchema } from "@/routes/permission/permission.model";
import { PermissionSchema } from "@/shared/models/shared-permission.model";
import z from "zod";

export type PermissionType = z.infer<typeof PermissionSchema>;
export type GetPermissionsResponseType = z.infer<typeof GetPermissionsResponseSchema>;
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;
export type PermissionParamsType = z.infer<typeof PermissionParamsSchema>;
export type PermissionQueryType = z.infer<typeof PermissionQuerySchema>;
