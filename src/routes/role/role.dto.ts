import { CreateRoleBodySchema, GetRolesResponseSchema, RoleParamsSchema, RoleQuerySchema, RoleWithPermissionsSchema, UpdateRoleBodySchema } from "@/routes/role/role.model";
import { RoleSchema } from "@/shared/models/shared-role.model";
import { createZodDto } from "nestjs-zod";

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) { }
export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) { }
export class RoleParamsDTO extends createZodDto(RoleParamsSchema) { }
export class RoleQueryDTO extends createZodDto(RoleQuerySchema) { }
export class GetRolesResponseDTO extends createZodDto(GetRolesResponseSchema) { }
export class RoleResponseDTO extends createZodDto(RoleSchema) { }
export class RoleWithPermissionsResponseDTO extends createZodDto(RoleWithPermissionsSchema) { }
