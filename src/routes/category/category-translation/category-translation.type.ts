import {
  CategoryTranslationResponseSchema,
  CreateCategoryTranslationBodySchema,
  UpdateCategoryTranslationBodySchema,
} from '@/routes/category/category-translation/category-translation.model';
import z from 'zod';

export type CreateCategoryTranslationBodyType = z.infer<typeof CreateCategoryTranslationBodySchema>;
export type UpdateCategoryTranslationBodyType = z.infer<typeof UpdateCategoryTranslationBodySchema>;
export type CategoryTranslationResponseType = z.infer<typeof CategoryTranslationResponseSchema>;
