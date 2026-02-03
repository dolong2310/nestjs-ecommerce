import {
  CreateProductBodySchema,
  GetManageProductsQuerySchema,
  GetProductParamsSchema,
  GetProductResponseSchema,
  GetProductsQuerySchema,
  GetProductsResponseSchema,
  UpdateProductBodySchema,
} from '@/routes/product/product.model';
import z from 'zod';

export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>;
export type GetManageProductsQueryType = z.infer<typeof GetManageProductsQuerySchema>;
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>;
export type GetProductsResponseType = z.infer<typeof GetProductsResponseSchema>;
export type GetProductResponseType = z.infer<typeof GetProductResponseSchema>;
