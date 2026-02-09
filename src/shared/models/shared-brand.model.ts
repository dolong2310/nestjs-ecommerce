import { stringToDate } from '@/shared/models/codecs';
import { BrandTranslationSchema } from '@/shared/models/shared-brand-translation.model';
import z from 'zod';

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().max(1000),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
  deletedAt: stringToDate.nullable(),
});

// Response
export const BrandIncludeTranslationsResponseSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
});
