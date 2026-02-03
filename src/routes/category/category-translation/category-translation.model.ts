import { CategoryTranslationSchema } from '@/shared/models/shared-category-translation.model';

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  categoryId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateCategoryTranslationBodySchema = CreateCategoryTranslationBodySchema.partial().strict();

// Response
export const CategoryTranslationResponseSchema = CategoryTranslationSchema;
