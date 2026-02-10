import { CartItemIncludeSkuAndProductSchema, CartItemSchema } from '@/shared/models/shared-cart.model';
import z from 'zod';

export type CartItemType = z.infer<typeof CartItemSchema>;
export type CartItemIncludeSkuAndProductType = z.infer<typeof CartItemIncludeSkuAndProductSchema>;
