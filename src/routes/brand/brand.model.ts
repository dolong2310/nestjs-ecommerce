import { PaginationQuerySchema } from '@/shared/models/request.model';
import { createPaginationResponseSchema } from '@/shared/models/response.model';
import { BrandIncludeTranslationsResponseSchema, BrandSchema } from '@/shared/models/shared-brand.model';
import z from 'zod';

export const GetBrandsQuerySchema = PaginationQuerySchema.extend({
  lang: z.string().optional().default('en'),
}).strict();

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  logo: true,
}).strict();

export const UpdateBrandBodySchema = CreateBrandBodySchema.partial().strict();

// Response
export const GetBrandsIncludeTranslationsResponseSchema = createPaginationResponseSchema(
  BrandIncludeTranslationsResponseSchema,
);

// export const GetBrandsResponseSchema = z.object({
//   data: z.array(BrandResponseSchema),
//   totalItems: z.number(),
//   totalPages: z.number(),
//   currentPage: z.number(),
//   limit: z.number(),
// });
