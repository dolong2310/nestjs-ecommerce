import {
  AddToCartBodySchema,
  CartItemDetailSchema,
  DeleteCartBodySchema,
  GetCartQuerySchema,
  GetCartResponseSchema,
  UpdateCartBodySchema,
} from '@/routes/cart/cart.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';
import { CartItemSchema } from '@/shared/models/shared-cart.model';

export class CartItemDTO extends createResponseDto(CartItemSchema) {}
export class CartItemDetailDTO extends createResponseDto(CartItemDetailSchema) {}
export class GetCartQueryDTO extends createRequestDto(GetCartQuerySchema) {}
export class AddToCartBodyDTO extends createRequestDto(AddToCartBodySchema) {}
export class UpdateCartBodyDTO extends createRequestDto(UpdateCartBodySchema) {}
export class DeleteCartBodyDTO extends createRequestDto(DeleteCartBodySchema) {}

export class GetCartResponseDTO extends createResponseDto(GetCartResponseSchema) {}
