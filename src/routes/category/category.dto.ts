import {
  CreateCategoryBodySchema,
  GetCategoriesIncludeTranslationsResponseSchema,
  GetCategoriesQuerySchema,
  UpdateCategoryBodySchema,
} from '@/routes/category/category.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';
import { CategoryIncludeTranslationsResponseSchema } from '@/shared/models/shared-category.model';

export class GetCategoriesQueryDTO extends createRequestDto(GetCategoriesQuerySchema) {}
export class CreateCategoryBodyDTO extends createRequestDto(CreateCategoryBodySchema) {}
export class UpdateCategoryBodyDTO extends createRequestDto(UpdateCategoryBodySchema) {}
export class GetCategoriesIncludeTranslationsResponseDTO extends createResponseDto(GetCategoriesIncludeTranslationsResponseSchema) {}
export class CategoryIncludeTranslationsResponseDTO extends createResponseDto(CategoryIncludeTranslationsResponseSchema) {}
