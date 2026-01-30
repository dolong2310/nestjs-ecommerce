import {
  CreateLanguageBodySchema,
  GetLanguageParamsSchema,
  GetLanguageResponseSchema,
  GetLanguagesResponseSchema,
  UpdateLanguageBodySchema,
} from '@/routes/language/language.model';
import { createZodDto } from 'nestjs-zod';

export class CreateLanguageBodyDTO extends createZodDto(CreateLanguageBodySchema) {}
export class UpdateLanguageBodyDTO extends createZodDto(UpdateLanguageBodySchema) {}
export class GetLanguageParamsDTO extends createZodDto(GetLanguageParamsSchema) {}
export class GetLanguageResponseDTO extends createZodDto(GetLanguageResponseSchema) {}
export class GetLanguagesResponseDTO extends createZodDto(GetLanguagesResponseSchema) {}
