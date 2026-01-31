import {
  BrandIncludeTranslationsResponseSchema,
  CreateBrandBodySchema,
  GetBrandsQuerySchema,
  GetBrandsIncludeTranslationsResponseSchema,
  UpdateBrandBodySchema,
} from '@/routes/brand/brand.model';
import { createZodDto } from 'nestjs-zod';

export class GetBrandsQueryDTO extends createZodDto(GetBrandsQuerySchema) {}
export class CreateBrandBodyDTO extends createZodDto(CreateBrandBodySchema) {}
export class UpdateBrandBodyDTO extends createZodDto(UpdateBrandBodySchema) {}
export class GetBrandsIncludeTranslationsResponseDTO extends createZodDto(GetBrandsIncludeTranslationsResponseSchema) {}
export class BrandIncludeTranslationsResponseDTO extends createZodDto(BrandIncludeTranslationsResponseSchema) {}
