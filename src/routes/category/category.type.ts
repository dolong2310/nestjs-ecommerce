import {
  CreateCategoryBodySchema,
  GetCategoriesIncludeTranslationsResponseSchema,
  GetCategoriesQuerySchema,
  UpdateCategoryBodySchema,
} from '@/routes/category/category.model';
import { CategoryIncludeTranslationsResponseSchema, CategorySchema } from '@/shared/models/shared-category.model';
import z from 'zod';

export type CategoryType = z.infer<typeof CategorySchema>;
export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>;
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
export type GetCategoriesIncludeTranslationsResponseType = z.infer<typeof GetCategoriesIncludeTranslationsResponseSchema>;
export type CategoryIncludeTranslationsResponseType = z.infer<typeof CategoryIncludeTranslationsResponseSchema>;
