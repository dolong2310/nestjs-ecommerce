import {
  BrandTranslationResponseSchema,
  CreateBrandTranslationBodySchema,
  UpdateBrandTranslationBodySchema,
} from '@/routes/brand/brand-translation/brand-translation.model';
import { createZodDto } from 'nestjs-zod';

export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}
export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}
export class BrandTranslationResponseDTO extends createZodDto(BrandTranslationResponseSchema) {}
