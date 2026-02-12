import { BrandTranslationSchema } from '@/shared/models/shared-brand-translation.model';

export const CreateBrandTranslationBodySchema = BrandTranslationSchema.pick({
  brandId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateBrandTranslationBodySchema = CreateBrandTranslationBodySchema.partial().strict();

// Response
export const BrandTranslationResponseSchema = BrandTranslationSchema.omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
});
