import { CreatePermissionBodySchema, GetPermissionsResponseSchema, PermissionParamsSchema, PermissionQuerySchema, UpdatePermissionBodySchema } from "@/routes/permission/permission.model";
import { PermissionSchema } from "@/shared/models/shared-permission.model";
import { createZodDto } from "nestjs-zod";

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) { }
export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) { }
export class PermissionParamsDTO extends createZodDto(PermissionParamsSchema) { }
export class PermissionQueryDTO extends createZodDto(PermissionQuerySchema) { }
export class GetPermissionsResponseDTO extends createZodDto(GetPermissionsResponseSchema) { }
export class PermissionResponseDTO extends createZodDto(PermissionSchema) { }
