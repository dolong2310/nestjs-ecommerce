import {
  CreateProductTranslationBodySchema,
  ProductTranslationResponseSchema,
  UpdateProductTranslationBodySchema,
} from '@/routes/product/product-translation/product-translation.model';
import { createZodDto } from 'nestjs-zod';

export class CreateProductTranslationBodyDTO extends createZodDto(CreateProductTranslationBodySchema) {}
export class UpdateProductTranslationBodyDTO extends createZodDto(UpdateProductTranslationBodySchema) {}
export class ProductTranslationResponseDTO extends createZodDto(ProductTranslationResponseSchema) {}
