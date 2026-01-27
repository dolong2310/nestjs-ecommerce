import { CreateRoleBodySchema, GetRolesResponseSchema, RoleParamsSchema, RoleQuerySchema, RoleSchema, UpdateRoleBodySchema } from "@/routes/role/role.model";
import { createZodDto } from "nestjs-zod";

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) { }
export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) { }
export class RoleParamsDTO extends createZodDto(RoleParamsSchema) { }
export class RoleQueryDTO extends createZodDto(RoleQuerySchema) { }
export class GetRolesResponseDTO extends createZodDto(GetRolesResponseSchema) { }
export class RoleResponseDTO extends createZodDto(RoleSchema) { }
