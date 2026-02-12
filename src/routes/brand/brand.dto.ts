import {
  CreateBrandBodySchema,
  GetBrandsIncludeTranslationsResponseSchema,
  GetBrandsQuerySchema,
  UpdateBrandBodySchema,
} from '@/routes/brand/brand.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';
import { BrandIncludeTranslationsResponseSchema } from '@/shared/models/shared-brand.model';

export class GetBrandsQueryDTO extends createRequestDto(GetBrandsQuerySchema) {}
export class CreateBrandBodyDTO extends createRequestDto(CreateBrandBodySchema) {}
export class UpdateBrandBodyDTO extends createRequestDto(UpdateBrandBodySchema) {}

export class GetBrandsIncludeTranslationsResponseDTO extends createResponseDto(GetBrandsIncludeTranslationsResponseSchema) {}
export class BrandIncludeTranslationsResponseDTO extends createResponseDto(BrandIncludeTranslationsResponseSchema) {}
