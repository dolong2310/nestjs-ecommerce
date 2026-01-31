import {
  BrandTranslationResponseSchema,
  CreateBrandTranslationBodySchema,
  UpdateBrandTranslationBodySchema,
} from '@/routes/brand/brand-translation/brand-translation.model';
import z from 'zod';

export type CreateBrandTranslationBodyType = z.infer<typeof CreateBrandTranslationBodySchema>;
export type UpdateBrandTranslationBodyType = z.infer<typeof UpdateBrandTranslationBodySchema>;
export type BrandTranslationResponseType = z.infer<typeof BrandTranslationResponseSchema>;
