import { ProductTranslationSchema } from '@/shared/models/shared-product-translation.model';

export const CreateProductTranslationBodySchema = ProductTranslationSchema.pick({
  productId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateProductTranslationBodySchema = CreateProductTranslationBodySchema.partial().strict();

// Response
export const ProductTranslationResponseSchema = ProductTranslationSchema.omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
});
