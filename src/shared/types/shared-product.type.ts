import { ProductSchema, VariantsSchema } from '@/shared/models/shared-product.model';
import z from 'zod';

export type ProductType = z.infer<typeof ProductSchema>;
export type VariantsType = z.infer<typeof VariantsSchema>;
