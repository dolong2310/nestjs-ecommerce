import {
  ApproveLaunchpadBodySchema,
  CreateLaunchpadBodySchema,
  GetLaunchpadParamsSchema,
  GetLaunchpadResponseSchema,
  GetLaunchpadsQuerySchema,
  GetLaunchpadsResponseSchema,
  GetManageLaunchpadsQuerySchema,
  GetManageLaunchpadsResponseSchema,
  ManageLaunchpadResponseSchema,
  PurchaseLaunchpadBodySchema,
  PurchaseLaunchpadResponseSchema,
  RejectLaunchpadBodySchema,
  UpdateLaunchpadBodySchema,
} from '@/routes/launchpad/launchpad.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class GetLaunchpadsQueryDTO extends createRequestDto(GetLaunchpadsQuerySchema) {}
export class GetManageLaunchpadsQueryDTO extends createRequestDto(GetManageLaunchpadsQuerySchema) {}
export class GetLaunchpadParamsDTO extends createRequestDto(GetLaunchpadParamsSchema) {}
export class CreateLaunchpadBodyDTO extends createRequestDto(CreateLaunchpadBodySchema) {}
export class UpdateLaunchpadBodyDTO extends createRequestDto(UpdateLaunchpadBodySchema) {}
export class ApproveLaunchpadBodyDTO extends createRequestDto(ApproveLaunchpadBodySchema) {}
export class RejectLaunchpadBodyDTO extends createRequestDto(RejectLaunchpadBodySchema) {}
export class PurchaseLaunchpadBodyDTO extends createRequestDto(PurchaseLaunchpadBodySchema) {}

export class GetLaunchpadsResponseDTO extends createResponseDto(GetLaunchpadsResponseSchema) {}
export class GetLaunchpadResponseDTO extends createResponseDto(GetLaunchpadResponseSchema) {}
export class GetManageLaunchpadsResponseDTO extends createResponseDto(GetManageLaunchpadsResponseSchema) {}
export class ManageLaunchpadResponseDTO extends createResponseDto(ManageLaunchpadResponseSchema) {}
export class PurchaseLaunchpadResponseDTO extends createResponseDto(PurchaseLaunchpadResponseSchema) {}
