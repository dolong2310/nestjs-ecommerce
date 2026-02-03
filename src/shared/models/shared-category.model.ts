import z from 'zod';
import { CategoryTranslationSchema } from './shared-category-translation.model';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().max(1000).nullable(),
  parentCategoryId: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

// Response
export const CategoryIncludeTranslationsResponseSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
});
