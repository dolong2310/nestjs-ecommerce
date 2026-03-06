import {
  LanguageOrProductNotFoundException,
  ProductTranslationAlreadyExistsException,
  ProductTranslationNotFoundException,
} from '@/routes/product/product-translation/product-translation.error';
import { ProductTranslationRepository } from '@/routes/product/product-translation/product-translation.repo';
import {
  CreateProductTranslationBodyType,
  ProductTranslationResponseType,
  UpdateProductTranslationBodyType,
} from '@/routes/product/product-translation/product-translation.type';
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductTranslationService {
  constructor(private readonly productTranslationRepository: ProductTranslationRepository) {}

  async getProductTranslationById(id: number): Promise<ProductTranslationResponseType> {
    const productTranslation = await this.productTranslationRepository.findOne(id);
    if (!productTranslation) {
      throw ProductTranslationNotFoundException;
    }
    return productTranslation;
  }

  async createProductTranslation(payload: {
    userId: number;
    body: CreateProductTranslationBodyType;
  }): Promise<ProductTranslationResponseType> {
    try {
      return await this.productTranslationRepository.create(payload);
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw LanguageOrProductNotFoundException;
      }
      throw error;
    }
  }

  async updateProductTranslation(payload: {
    id: number;
    userId: number;
    body: UpdateProductTranslationBodyType;
  }): Promise<ProductTranslationResponseType> {
    try {
      return await this.productTranslationRepository.update(payload);
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductTranslationNotFoundException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw LanguageOrProductNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async deleteProductTranslation(payload: { id: number; userId: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = false;
      await this.productTranslationRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.DeleteProductTranslation',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductTranslationNotFoundException;
      }
      throw error;
    }
  }
}
