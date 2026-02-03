import {
  CreateProductBodySchema,
  GetManageProductsQuerySchema,
  GetProductParamsSchema,
  GetProductResponseSchema,
  GetProductsQuerySchema,
  GetProductsResponseSchema,
  UpdateProductBodySchema,
} from '@/routes/product/product.model';
import { ProductSchema } from '@/shared/models/shared-product.model';
import { createZodDto } from 'nestjs-zod';

export class CreateProductBodyDTO extends createZodDto(CreateProductBodySchema) {}
export class UpdateProductBodyDTO extends createZodDto(UpdateProductBodySchema) {}
export class GetProductsQueryDTO extends createZodDto(GetProductsQuerySchema) {}
export class GetManageProductsQueryDTO extends createZodDto(GetManageProductsQuerySchema) {}
export class GetProductParamsDTO extends createZodDto(GetProductParamsSchema) {}
export class GetProductsResponseDTO extends createZodDto(GetProductsResponseSchema) {}
export class GetProductResponseDTO extends createZodDto(GetProductResponseSchema) {}
export class ProductResponseDTO extends createZodDto(ProductSchema) {}
