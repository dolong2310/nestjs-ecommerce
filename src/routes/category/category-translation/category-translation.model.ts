import z from 'zod';

export const CategoryTranslationSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  languageId: z.string(),
  name: z.string().max(500),
  description: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  categoryId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateCategoryTranslationBodySchema = CreateCategoryTranslationBodySchema.partial().strict();

// Response
export const CategoryTranslationResponseSchema = CategoryTranslationSchema;
