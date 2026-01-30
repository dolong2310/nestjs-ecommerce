import { ChangePasswordBodySchema, UpdateProfileBodySchema } from '@/routes/profile/profile.model';
import { createZodDto } from 'nestjs-zod';

export class UpdateProfileBodyDTO extends createZodDto(UpdateProfileBodySchema) {}
export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
