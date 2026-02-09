import { stringToDate } from '@/shared/models/codecs';
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
  deletedAt: stringToDate.nullable(),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
});
