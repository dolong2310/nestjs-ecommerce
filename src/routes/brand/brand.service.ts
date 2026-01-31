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

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async getBrands(query: GetBrandsQueryType): Promise<GetBrandsIncludeTranslationsResponseType> {
    try {
      return await this.brandRepository.findMany(query);
    } catch (error) {
      throw error;
    }
  }

  async getBrandById(id: number): Promise<BrandIncludeTranslationsResponseType> {
    try {
      const brand = await this.brandRepository.findOne(id);
      if (!brand) {
        throw BrandNotFoundException;
      }
      return brand;
    } catch (error) {
      throw error;
    }
  }

  async createBrand(payload: {
    userId: number;
    body: CreateBrandBodyType;
  }): Promise<BrandIncludeTranslationsResponseType> {
    try {
      return await this.brandRepository.create(payload);
    } catch (error) {
      throw error;
    }
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
