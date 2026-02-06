import { createResponseDto } from '@/shared/helpers/zod-dto';
import { GetUserProfileResponseSchema, UpdateUserProfileResponseSchema } from '@/shared/models/shared-user.model';

export class GetUserProfileResponseDTO extends createResponseDto(GetUserProfileResponseSchema) {}
export class UpdateUserProfileResponseDTO extends createResponseDto(UpdateUserProfileResponseSchema) {}
