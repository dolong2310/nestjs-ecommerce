import { stringToDate } from '@/shared/models/codecs';
import z from 'zod';

export const SkuSchema = z.object({
  id: z.number(),
  value: z.string().max(500).trim(),
  price: z.number().min(0),
  stock: z.number().min(0),
  image: z.string(),
  productId: z.number(),

  createdById: z.number(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),

  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
  deletedAt: stringToDate.nullable(),
});
