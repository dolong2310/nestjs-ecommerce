import {
  CategoryTranslationResponseSchema,
  CreateCategoryTranslationBodySchema,
  UpdateCategoryTranslationBodySchema,
} from '@/routes/category/category-translation/category-translation.model';
import { createZodDto } from 'nestjs-zod';

export class CreateCategoryTranslationBodyDTO extends createZodDto(CreateCategoryTranslationBodySchema) {}
export class UpdateCategoryTranslationBodyDTO extends createZodDto(UpdateCategoryTranslationBodySchema) {}
export class CategoryTranslationResponseDTO extends createZodDto(CategoryTranslationResponseSchema) {}
