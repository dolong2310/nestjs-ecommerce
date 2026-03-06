import {
  CategoryTranslationAlreadyExistsException,
  CategoryTranslationNotFoundException,
  LanguageNotFoundException,
} from '@/routes/category/category-translation/category-translation.error';
import { CategoryTranslationRepository } from '@/routes/category/category-translation/category-translation.repo';
import {
  CategoryTranslationResponseType,
  CreateCategoryTranslationBodyType,
  UpdateCategoryTranslationBodyType,
} from '@/routes/category/category-translation/category-translation.type';
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryTranslationService {
  constructor(private readonly categoryTranslationRepository: CategoryTranslationRepository) {}

  async getCategoryTranslationById(id: number): Promise<CategoryTranslationResponseType> {
    const categoryTranslation = await this.categoryTranslationRepository.findOne(id);
    if (!categoryTranslation) {
      throw CategoryTranslationNotFoundException;
    }
    return categoryTranslation;
  }

  async createCategoryTranslation(payload: {
    userId: number;
    body: CreateCategoryTranslationBodyType;
  }): Promise<CategoryTranslationResponseType> {
    try {
      return await this.categoryTranslationRepository.create(payload);
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw LanguageNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async updateCategoryTranslation(payload: {
    id: number;
    userId: number;
    body: UpdateCategoryTranslationBodyType;
  }): Promise<CategoryTranslationResponseType> {
    try {
      return await this.categoryTranslationRepository.update(payload);
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CategoryTranslationNotFoundException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw LanguageNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async deleteCategoryTranslation(payload: { id: number; userId: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = false;
      await this.categoryTranslationRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.DeleteCategoryTranslation',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CategoryTranslationNotFoundException;
      }
      throw error;
    }
  }
}
