import {
  CancelOrderResponseSchema,
  CreateOrderBodySchema,
  CreateOrderResponseSchema,
  GetOrderParamsSchema,
  GetOrderResponseSchema,
  GetOrdersQuerySchema,
  GetOrdersResponseSchema,
} from '@/routes/order/order.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class GetOrdersQueryDTO extends createRequestDto(GetOrdersQuerySchema) {}
export class GetOrderParamsDTO extends createRequestDto(GetOrderParamsSchema) {}
export class CreateOrderBodyDTO extends createRequestDto(CreateOrderBodySchema) {}

export class CreateOrderResponseDTO extends createResponseDto(CreateOrderResponseSchema) {}
export class CancelOrderResponseDTO extends createResponseDto(CancelOrderResponseSchema) {}
export class GetOrderResponseDTO extends createResponseDto(GetOrderResponseSchema) {}
export class GetOrdersResponseDTO extends createResponseDto(GetOrdersResponseSchema) {}
