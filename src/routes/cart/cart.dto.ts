import {
  AddToCartBodySchema,
  CartItemDetailSchema,
  CartItemSchema,
  DeleteCartBodySchema,
  GetCartQuerySchema,
  GetCartResponseSchema,
  UpdateCartBodySchema,
} from '@/routes/cart/cart.model';
import { createZodDto } from 'nestjs-zod';

export class CartItemDTO extends createZodDto(CartItemSchema) {}
export class CartItemDetailDTO extends createZodDto(CartItemDetailSchema) {}
export class GetCartQueryDTO extends createZodDto(GetCartQuerySchema) {}
export class AddToCartBodyDTO extends createZodDto(AddToCartBodySchema) {}
export class UpdateCartBodyDTO extends createZodDto(UpdateCartBodySchema) {}
export class DeleteCartBodyDTO extends createZodDto(DeleteCartBodySchema) {}
export class GetCartResponseDTO extends createZodDto(GetCartResponseSchema) {}
