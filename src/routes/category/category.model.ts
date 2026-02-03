import { CategoryIncludeTranslationsResponseSchema, CategorySchema } from '@/shared/models/shared-category.model';
import z from 'zod';

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
export const GetCategoriesIncludeTranslationsResponseSchema = z.object({
  data: z.array(CategoryIncludeTranslationsResponseSchema),
  totalItems: z.number(),
});
