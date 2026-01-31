import { BrandTranslationSchema } from '@/routes/brand/brand-translation/brand-translation.model';
import { PaginationQuerySchema } from '@/shared/models/request.model';
import { createPaginationResponseSchema } from '@/shared/models/response.model';
import z from 'zod';

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().max(1000),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

export const GetBrandsQuerySchema = PaginationQuerySchema.extend({
  lang: z.string().optional().default('en'),
}).strict();

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  logo: true,
}).strict();

export const UpdateBrandBodySchema = CreateBrandBodySchema.partial().strict();

// Response
export const BrandIncludeTranslationsResponseSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
});

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
