import {
  CreateRoleBodySchema,
  GetRolesResponseSchema,
  RoleParamsSchema,
  RoleQuerySchema,
  UpdateRoleBodySchema,
} from '@/routes/role/role.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';
import { RoleSchema, RoleWithPermissionsSchema } from '@/shared/models/shared-role.model';

export class CreateRoleBodyDTO extends createRequestDto(CreateRoleBodySchema) {}
export class UpdateRoleBodyDTO extends createRequestDto(UpdateRoleBodySchema) {}
export class RoleParamsDTO extends createRequestDto(RoleParamsSchema) {}
export class RoleQueryDTO extends createRequestDto(RoleQuerySchema) {}
export class GetRolesResponseDTO extends createResponseDto(GetRolesResponseSchema) {}
export class RoleResponseDTO extends createResponseDto(RoleSchema) {}
export class RoleWithPermissionsResponseDTO extends createResponseDto(RoleWithPermissionsSchema) {}
