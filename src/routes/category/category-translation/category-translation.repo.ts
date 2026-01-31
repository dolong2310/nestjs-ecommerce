import {
  CategoryTranslationResponseType,
  CreateCategoryTranslationBodyType,
  UpdateCategoryTranslationBodyType,
} from '@/routes/category/category-translation/category-translation.type';
import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(id: number): Promise<CategoryTranslationResponseType | null> {
    return this.prismaService.categoryTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(payload: {
    userId: number;
    body: CreateCategoryTranslationBodyType;
  }): Promise<CategoryTranslationResponseType> {
    const { userId, body } = payload;
    return this.prismaService.categoryTranslation.create({
      data: {
        categoryId: body.categoryId,
        languageId: body.languageId,
        name: body.name,
        description: body.description,
        createdById: userId,
      },
    });
  }

  async update(payload: {
    id: number;
    userId: number;
    body: UpdateCategoryTranslationBodyType;
  }): Promise<CategoryTranslationResponseType> {
    const { id, userId, body } = payload;
    return this.prismaService.categoryTranslation.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        categoryId: body.categoryId,
        languageId: body.languageId,
        name: body.name,
        description: body.description,
        updatedById: userId,
      },
    });
  }

  async delete(
    payload: { id: number; userId: number },
    isHardDelete: boolean = false,
  ): Promise<CategoryTranslationResponseType> {
    const { id, userId } = payload;
    return isHardDelete
      ? this.prismaService.categoryTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.categoryTranslation.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById: userId,
          },
        });
  }
}
