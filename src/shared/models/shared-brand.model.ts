import { BrandTranslationSchema } from '@/shared/models/shared-brand-translation.model';
import z from 'zod';

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().max(1000),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

// Response
export const BrandIncludeTranslationsResponseSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
});
