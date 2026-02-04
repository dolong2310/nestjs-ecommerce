import {
  CancelOrderResponseSchema,
  CreateOrderBodySchema,
  CreateOrderResponseSchema,
  GetOrderParamsSchema,
  GetOrderResponseSchema,
  GetOrdersQuerySchema,
  GetOrdersResponseSchema,
} from '@/routes/order/order.model';
import { createZodDto } from 'nestjs-zod';

export class GetOrdersQueryDTO extends createZodDto(GetOrdersQuerySchema) {}
export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}
export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}
export class CreateOrderResponseDTO extends createZodDto(CreateOrderResponseSchema) {}
export class CancelOrderResponseDTO extends createZodDto(CancelOrderResponseSchema) {}
export class GetOrderResponseDTO extends createZodDto(GetOrderResponseSchema) {}
export class GetOrdersResponseDTO extends createZodDto(GetOrdersResponseSchema) {}
