import {
  CreateLanguageBodySchema,
  GetLanguageParamsSchema,
  GetLanguageResponseSchema,
  GetLanguagesResponseSchema,
  UpdateLanguageBodySchema,
} from '@/routes/language/language.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class CreateLanguageBodyDTO extends createRequestDto(CreateLanguageBodySchema) {}
export class UpdateLanguageBodyDTO extends createRequestDto(UpdateLanguageBodySchema) {}
export class GetLanguageParamsDTO extends createRequestDto(GetLanguageParamsSchema) {}

export class GetLanguageResponseDTO extends createResponseDto(GetLanguageResponseSchema) {}
export class GetLanguagesResponseDTO extends createResponseDto(GetLanguagesResponseSchema) {}
