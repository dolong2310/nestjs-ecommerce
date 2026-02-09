import {
  CategoryTranslationResponseSchema,
  CreateCategoryTranslationBodySchema,
  UpdateCategoryTranslationBodySchema,
} from '@/routes/category/category-translation/category-translation.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class CreateCategoryTranslationBodyDTO extends createRequestDto(CreateCategoryTranslationBodySchema) {}
export class UpdateCategoryTranslationBodyDTO extends createRequestDto(UpdateCategoryTranslationBodySchema) {}
export class CategoryTranslationResponseDTO extends createResponseDto(CategoryTranslationResponseSchema) {}
