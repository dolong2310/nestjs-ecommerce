import {
  BrandTranslationAlreadyExistsException,
  BrandTranslationNotFoundException,
} from '@/routes/brand/brand-translation/brand-translation.error';
import { BrandTranslationRepository } from '@/routes/brand/brand-translation/brand-translation.repo';
import {
  BrandTranslationResponseType,
  CreateBrandTranslationBodyType,
  UpdateBrandTranslationBodyType,
} from '@/routes/brand/brand-translation/brand-translation.type';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandTranslationService {
  constructor(private readonly brandTranslationRepository: BrandTranslationRepository) {}

  async getBrandTranslationById(id: number): Promise<BrandTranslationResponseType> {
    try {
      const brandTranslation = await this.brandTranslationRepository.findOne(id);
      if (!brandTranslation) {
        throw BrandTranslationNotFoundException;
      }
      return brandTranslation;
    } catch (error) {
      throw error;
    }
  }

  async createBrandTranslation(payload: {
    userId: number;
    body: CreateBrandTranslationBodyType;
  }): Promise<BrandTranslationResponseType> {
    try {
      return await this.brandTranslationRepository.create(payload);
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async updateBrandTranslation(payload: {
    id: number;
    userId: number;
    body: UpdateBrandTranslationBodyType;
  }): Promise<BrandTranslationResponseType> {
    try {
      return await this.brandTranslationRepository.update(payload);
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandTranslationNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async deleteBrandTranslation(payload: { id: number; userId: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = false;
      await this.brandTranslationRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.DeleteBrandTranslation',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandTranslationNotFoundException;
      }
      throw error;
    }
  }
}
