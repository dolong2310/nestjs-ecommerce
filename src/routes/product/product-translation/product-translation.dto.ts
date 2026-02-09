import {
  CreateProductTranslationBodySchema,
  ProductTranslationResponseSchema,
  UpdateProductTranslationBodySchema,
} from '@/routes/product/product-translation/product-translation.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class CreateProductTranslationBodyDTO extends createRequestDto(CreateProductTranslationBodySchema) {}
export class UpdateProductTranslationBodyDTO extends createRequestDto(UpdateProductTranslationBodySchema) {}
export class ProductTranslationResponseDTO extends createResponseDto(ProductTranslationResponseSchema) {}
