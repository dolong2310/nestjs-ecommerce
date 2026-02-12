import {
  CreatePermissionBodySchema,
  GetPermissionResponseSchema,
  GetPermissionsResponseSchema,
  PermissionParamsSchema,
  PermissionQuerySchema,
  UpdatePermissionBodySchema,
} from '@/routes/permission/permission.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class CreatePermissionBodyDTO extends createRequestDto(CreatePermissionBodySchema) {}
export class UpdatePermissionBodyDTO extends createRequestDto(UpdatePermissionBodySchema) {}
export class PermissionParamsDTO extends createRequestDto(PermissionParamsSchema) {}
export class PermissionQueryDTO extends createRequestDto(PermissionQuerySchema) {}

export class GetPermissionsResponseDTO extends createResponseDto(GetPermissionsResponseSchema) {}
export class PermissionResponseDTO extends createResponseDto(GetPermissionResponseSchema) {}
