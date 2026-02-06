import {
  CreateProductBodySchema,
  GetManageProductsQuerySchema,
  GetProductParamsSchema,
  GetProductResponseSchema,
  GetProductsQuerySchema,
  GetProductsResponseSchema,
  UpdateProductBodySchema,
} from '@/routes/product/product.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';
import { ProductSchema } from '@/shared/models/shared-product.model';

export class CreateProductBodyDTO extends createRequestDto(CreateProductBodySchema) {}
export class UpdateProductBodyDTO extends createRequestDto(UpdateProductBodySchema) {}
export class GetProductsQueryDTO extends createRequestDto(GetProductsQuerySchema) {}
export class GetManageProductsQueryDTO extends createRequestDto(GetManageProductsQuerySchema) {}
export class GetProductParamsDTO extends createRequestDto(GetProductParamsSchema) {}
export class GetProductsResponseDTO extends createResponseDto(GetProductsResponseSchema) {}
export class GetProductResponseDTO extends createResponseDto(GetProductResponseSchema) {}
export class ProductResponseDTO extends createResponseDto(ProductSchema) {}
