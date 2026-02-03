import { SkuSchema } from '@/shared/models/shared-sku.model';
import z from 'zod';

export const UpsertSkuBodySchema = SkuSchema.pick({
  value: true,
  price: true,
  stock: true,
  image: true,
});

export type UpsertSkuBodyType = z.infer<typeof UpsertSkuBodySchema>;
