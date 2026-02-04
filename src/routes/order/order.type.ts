import {
  CancelOrderResponseSchema,
  CreateOrderBodySchema,
  CreateOrderResponseSchema,
  GetOrderParamsSchema,
  GetOrderResponseSchema,
  GetOrdersQuerySchema,
  GetOrdersResponseSchema,
} from '@/routes/order/order.model';
import z from 'zod';

export type GetOrdersQueryType = z.infer<typeof GetOrdersQuerySchema>;
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>;
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>;
export type CreateOrderResponseType = z.infer<typeof CreateOrderResponseSchema>;
export type CancelOrderResponseType = z.infer<typeof CancelOrderResponseSchema>;
export type GetOrderResponseType = z.infer<typeof GetOrderResponseSchema>;
export type GetOrdersResponseType = z.infer<typeof GetOrdersResponseSchema>;
