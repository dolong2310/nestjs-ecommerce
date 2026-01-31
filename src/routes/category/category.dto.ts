import {
  CategoryIncludeTranslationsResponseSchema,
  CreateCategoryBodySchema,
  GetCategoriesQuerySchema,
  GetCategoriesIncludeTranslationsResponseSchema,
  UpdateCategoryBodySchema,
} from '@/routes/category/category.model';
import { createZodDto } from 'nestjs-zod';

export class GetCategoriesQueryDTO extends createZodDto(GetCategoriesQuerySchema) {}
export class CreateCategoryBodyDTO extends createZodDto(CreateCategoryBodySchema) {}
export class UpdateCategoryBodyDTO extends createZodDto(UpdateCategoryBodySchema) {}
export class GetCategoriesIncludeTranslationsResponseDTO extends createZodDto(GetCategoriesIncludeTranslationsResponseSchema) {}
export class CategoryIncludeTranslationsResponseDTO extends createZodDto(CategoryIncludeTranslationsResponseSchema) {}
