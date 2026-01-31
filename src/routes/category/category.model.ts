import { CategoryTranslationSchema } from '@/routes/category/category-translation/category-translation.model';
import z from 'zod';

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

export const GetCategoriesQuerySchema = z
  .object({
    parentCategoryId: z.coerce.number().int().positive().optional().nullable(),
    lang: z.string().optional().default('en'),
  })
  .strict();

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict();
// .extend({
//   parentCategoryId: z.coerce.number().int().positive().optional().nullable(),
// });

export const UpdateCategoryBodySchema = CreateCategoryBodySchema.partial().strict();

// Response
export const CategoryIncludeTranslationsResponseSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
});

export const GetCategoriesIncludeTranslationsResponseSchema = z.object({
  data: z.array(CategoryIncludeTranslationsResponseSchema),
  totalItems: z.number(),
});
