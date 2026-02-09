import { ChangePasswordBodySchema, UpdateProfileBodySchema } from '@/routes/profile/profile.model';
import { createRequestDto } from '@/shared/helpers/zod-dto';

export class UpdateProfileBodyDTO extends createRequestDto(UpdateProfileBodySchema) {}
export class ChangePasswordBodyDTO extends createRequestDto(ChangePasswordBodySchema) {}
