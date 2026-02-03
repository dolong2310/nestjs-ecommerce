import z from 'zod';

export const ProductTranslationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  languageId: z.string(),
  name: z.string(),
  description: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const CreateProductTranslationBodySchema = ProductTranslationSchema.pick({
  productId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateProductTranslationBodySchema = CreateProductTranslationBodySchema.partial().strict();

// Response
export const ProductTranslationResponseSchema = ProductTranslationSchema;
