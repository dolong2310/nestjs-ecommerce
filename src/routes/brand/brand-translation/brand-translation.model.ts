import z from 'zod';

export const BrandTranslationSchema = z.object({
  id: z.number(),
  brandId: z.number(),
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

export const CreateBrandTranslationBodySchema = BrandTranslationSchema.pick({
  brandId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateBrandTranslationBodySchema = CreateBrandTranslationBodySchema.partial().strict();

// Response
export const BrandTranslationResponseSchema = BrandTranslationSchema;
