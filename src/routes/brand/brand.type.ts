import {
  CreateBrandBodySchema,
  GetBrandsIncludeTranslationsResponseSchema,
  GetBrandsQuerySchema,
  UpdateBrandBodySchema,
} from '@/routes/brand/brand.model';
import { BrandIncludeTranslationsResponseSchema, BrandSchema } from '@/shared/models/shared-brand.model';
import z from 'zod';

export type BrandType = z.infer<typeof BrandSchema>;
export type GetBrandsQueryType = z.infer<typeof GetBrandsQuerySchema>;
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>;
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>;
export type GetBrandsIncludeTranslationsResponseType = z.infer<typeof GetBrandsIncludeTranslationsResponseSchema>;
export type BrandIncludeTranslationsResponseType = z.infer<typeof BrandIncludeTranslationsResponseSchema>;
