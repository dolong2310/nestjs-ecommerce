import {
  ProductTranslationResponseType,
  CreateProductTranslationBodyType,
  UpdateProductTranslationBodyType,
} from '@/routes/product/product-translation/product-translation.type';
import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(id: number): Promise<ProductTranslationResponseType | null> {
    return this.prismaService.productTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(payload: {
    userId: number;
    body: CreateProductTranslationBodyType;
  }): Promise<ProductTranslationResponseType> {
    const { userId, body } = payload;
    const { productId, languageId, name, description } = body;
    // TODO: kiểm tra nếu productId hoặc languageId đã xoá mềm thì không cho create => throw error
    return this.prismaService.productTranslation.create({
      data: {
        productId,
        languageId,
        name,
        description,
        createdById: userId,
      },
    });
  }

  async update(payload: {
    id: number;
    userId: number;
    body: UpdateProductTranslationBodyType;
  }): Promise<ProductTranslationResponseType> {
    const { id, userId, body } = payload;
    const { productId, languageId, name, description } = body;
    return this.prismaService.productTranslation.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        productId,
        languageId,
        name,
        description,
        updatedById: userId,
      },
    });
  }

  async delete(
    payload: { id: number; userId: number },
    isHardDelete: boolean = false,
  ): Promise<ProductTranslationResponseType> {
    const { id, userId } = payload;
    return isHardDelete
      ? this.prismaService.productTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.productTranslation.update({
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
