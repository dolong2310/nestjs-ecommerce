import {
  CreateBrandBodySchema,
  GetBrandsIncludeTranslationsResponseSchema,
  GetBrandsQuerySchema,
  UpdateBrandBodySchema,
} from '@/routes/brand/brand.model';
import { BrandIncludeTranslationsResponseSchema } from '@/shared/models/shared-brand.model';
import { createZodDto } from 'nestjs-zod';

export class GetBrandsQueryDTO extends createZodDto(GetBrandsQuerySchema) {}
export class CreateBrandBodyDTO extends createZodDto(CreateBrandBodySchema) {}
export class UpdateBrandBodyDTO extends createZodDto(UpdateBrandBodySchema) {}
export class GetBrandsIncludeTranslationsResponseDTO extends createZodDto(GetBrandsIncludeTranslationsResponseSchema) {}
export class BrandIncludeTranslationsResponseDTO extends createZodDto(BrandIncludeTranslationsResponseSchema) {}
