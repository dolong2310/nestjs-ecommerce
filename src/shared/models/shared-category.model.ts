import { stringToDate } from '@/shared/models/codecs';
import { CategoryTranslationSchema } from '@/shared/models/shared-category-translation.model';
import z from 'zod';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().max(1000).nullable(),
  parentCategoryId: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
  deletedAt: stringToDate.nullable(),
});

// Response
export const CategoryIncludeTranslationsResponseSchema = CategorySchema.extend({
  categoryTranslations: z.array(
    CategoryTranslationSchema.omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      deletedAt: true,
    }),
  ),
}).omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
});
