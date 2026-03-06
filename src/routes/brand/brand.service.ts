import { I18nTranslations } from '@/generated/i18n.generated';
import { BrandNotFoundException } from '@/routes/brand/brand.error';
import { BrandRepository } from '@/routes/brand/brand.repo';
import {
  BrandIncludeTranslationsResponseType,
  CreateBrandBodyType,
  GetBrandsIncludeTranslationsResponseType,
  GetBrandsQueryType,
  UpdateBrandBodyType,
} from '@/routes/brand/brand.type';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  getBrands(query: GetBrandsQueryType): Promise<GetBrandsIncludeTranslationsResponseType> {
    // console.log(this.i18n.t('error.NOT_FOUND', { lang: I18nContext.current()?.lang }));
    return this.brandRepository.findMany(query, query.lang);
  }

  async getBrandById(id: number, lang: string): Promise<BrandIncludeTranslationsResponseType> {
    const brand = await this.brandRepository.findOne(id, lang);
    if (!brand) {
      throw BrandNotFoundException;
    }
    return brand;
  }

  createBrand(payload: { userId: number; body: CreateBrandBodyType }): Promise<BrandIncludeTranslationsResponseType> {
    return this.brandRepository.create(payload);
  }

  async updateBrand(payload: {
    userId: number;
    id: number;
    body: UpdateBrandBodyType;
  }): Promise<BrandIncludeTranslationsResponseType> {
    try {
      return await this.brandRepository.update(payload);
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandNotFoundException;
      }
      throw error;
    }
  }

  async deleteBrand(payload: { userId: number; id: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = false;
      await this.brandRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.DeleteBrand',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandNotFoundException;
      }
      throw error;
    }
  }
}
