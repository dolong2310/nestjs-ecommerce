import {
  CreateProductTranslationBodySchema,
  ProductTranslationResponseSchema,
  UpdateProductTranslationBodySchema,
} from '@/routes/product/product-translation/product-translation.model';
import z from 'zod';

export type CreateProductTranslationBodyType = z.infer<typeof CreateProductTranslationBodySchema>;
export type UpdateProductTranslationBodyType = z.infer<typeof UpdateProductTranslationBodySchema>;
export type ProductTranslationResponseType = z.infer<typeof ProductTranslationResponseSchema>;
