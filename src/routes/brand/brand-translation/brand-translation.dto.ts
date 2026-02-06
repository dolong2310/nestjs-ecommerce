import {
  BrandTranslationResponseSchema,
  CreateBrandTranslationBodySchema,
  UpdateBrandTranslationBodySchema,
} from '@/routes/brand/brand-translation/brand-translation.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class CreateBrandTranslationBodyDTO extends createRequestDto(CreateBrandTranslationBodySchema) {}
export class UpdateBrandTranslationBodyDTO extends createRequestDto(UpdateBrandTranslationBodySchema) {}
export class BrandTranslationResponseDTO extends createResponseDto(BrandTranslationResponseSchema) {}
