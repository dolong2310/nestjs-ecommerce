import {
  CategoryIncludeTranslationsResponseType,
  CategoryType,
  CreateCategoryBodyType,
  GetCategoriesIncludeTranslationsResponseType,
  UpdateCategoryBodyType,
} from '@/routes/category/category.type';
import { translationWhere } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(payload: {
    parentCategoryId?: number | null;
    languageId: string;
  }): Promise<GetCategoriesIncludeTranslationsResponseType> {
    const categories = await this.prismaService.category.findMany({
      where: {
        deletedAt: null,
        parentCategoryId: payload.parentCategoryId ?? null,
      },
      include: {
        categoryTranslations: {
          where: translationWhere(payload.languageId),
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    return {
      data: categories,
      totalItems: categories.length,
    };
  }

  findOne(payload: { id: number; languageId: string }): Promise<CategoryIncludeTranslationsResponseType | null> {
    return this.prismaService.category.findUnique({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where: translationWhere(payload.languageId),
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  create(payload: { userId: number; body: CreateCategoryBodyType }): Promise<CategoryIncludeTranslationsResponseType> {
    return this.prismaService.category.create({
      data: {
        name: payload.body.name,
        logo: payload.body.logo,
        parentCategoryId: payload.body.parentCategoryId,
        createdById: payload.userId,
      },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  update(payload: {
    userId: number;
    id: number;
    body: UpdateCategoryBodyType;
  }): Promise<CategoryIncludeTranslationsResponseType> {
    return this.prismaService.category.update({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      data: {
        name: payload.body.name,
        logo: payload.body.logo,
        parentCategoryId: payload.body.parentCategoryId,
        updatedById: payload.userId,
      },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  delete(payload: { userId: number; id: number }, isHardDelete?: boolean): Promise<CategoryType> {
    return isHardDelete
      ? this.prismaService.category.delete({
          where: {
            id: payload.id,
          },
        })
      : this.prismaService.category.update({
          where: {
            id: payload.id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById: payload.userId,
          },
        });
  }
}
