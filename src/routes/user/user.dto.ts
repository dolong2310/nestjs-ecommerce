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
import { createZodDto } from 'nestjs-zod';

export class UserParamsDTO extends createZodDto(UserParamsSchema) {}
export class UserQueryDTO extends createZodDto(UserQuerySchema) {}
export class GetUsersResponseDTO extends createZodDto(GetUsersResponseSchema) {}
export class GetUserResponseDTO extends createZodDto(GetUserResponseSchema) {}
export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
export class CreateUserResponseDTO extends createZodDto(CreateUserResponseSchema) {}
export class UpdateUserResponseDTO extends createZodDto(UpdateUserResponseSchema) {}
