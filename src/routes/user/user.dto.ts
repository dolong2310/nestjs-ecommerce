import {
  CreateUserBodySchema,
  CreateUserResponseSchema,
  GetUserResponseSchema,
  GetUsersResponseSchema,
  UpdateUserBodySchema,
  UpdateUserResponseSchema,
  UserParamsSchema,
  UserQuerySchema,
} from '@/routes/user/user.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class UserParamsDTO extends createRequestDto(UserParamsSchema) {}
export class UserQueryDTO extends createRequestDto(UserQuerySchema) {}
export class CreateUserBodyDTO extends createRequestDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createRequestDto(UpdateUserBodySchema) {}

export class GetUsersResponseDTO extends createResponseDto(GetUsersResponseSchema) {}
export class GetUserResponseDTO extends createResponseDto(GetUserResponseSchema) {}
export class CreateUserResponseDTO extends createResponseDto(CreateUserResponseSchema) {}
export class UpdateUserResponseDTO extends createResponseDto(UpdateUserResponseSchema) {}
