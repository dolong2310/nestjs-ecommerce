import {
  AddToCartBodySchema,
  CartItemDetailSchema,
  DeleteCartBodySchema,
  GetCartQuerySchema,
  GetCartResponseSchema,
  UpdateCartBodySchema,
} from '@/routes/cart/cart.model';
import z from 'zod';

export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>;
export type GetCartQueryType = z.infer<typeof GetCartQuerySchema>;
export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>;
export type UpdateCartBodyType = z.infer<typeof UpdateCartBodySchema>;
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>;
export type GetCartResponseType = z.infer<typeof GetCartResponseSchema>;
