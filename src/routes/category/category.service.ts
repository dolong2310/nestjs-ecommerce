import { I18nTranslations } from '@/generated/i18n.generated';
import { CategoryNotFoundException } from '@/routes/category/category.error';
import { CategoryRepository } from '@/routes/category/category.repo';
import {
  CategoryIncludeTranslationsResponseType,
  CreateCategoryBodyType,
  GetCategoriesIncludeTranslationsResponseType,
  GetCategoriesQueryType,
  UpdateCategoryBodyType,
} from '@/routes/category/category.type';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  getCategories(query: GetCategoriesQueryType): Promise<GetCategoriesIncludeTranslationsResponseType> {
    return this.categoryRepository.findMany({
      parentCategoryId: query.parentCategoryId,
      languageId: query.lang,
    });
  }

  async getCategoryById(payload: { id: number; languageId: string }): Promise<CategoryIncludeTranslationsResponseType> {
    const category = await this.categoryRepository.findOne({
      id: payload.id,
      languageId: payload.languageId,
    });
    if (!category) {
      throw CategoryNotFoundException;
    }
    return category;
  }

  createCategory(payload: {
    userId: number;
    body: CreateCategoryBodyType;
  }): Promise<CategoryIncludeTranslationsResponseType> {
    return this.categoryRepository.create(payload);
  }

  async updateCategory(payload: {
    userId: number;
    id: number;
    body: UpdateCategoryBodyType;
  }): Promise<CategoryIncludeTranslationsResponseType> {
    try {
      return await this.categoryRepository.update(payload);
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CategoryNotFoundException;
      }
      throw error;
    }
  }

  async deleteCategory(payload: { userId: number; id: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = false;
      await this.categoryRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.DeleteCategory',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CategoryNotFoundException;
      }
      throw error;
    }
  }
}
