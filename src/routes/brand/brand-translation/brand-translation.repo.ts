import {
  BrandTranslationResponseType,
  CreateBrandTranslationBodyType,
  UpdateBrandTranslationBodyType,
} from '@/routes/brand/brand-translation/brand-translation.type';
import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(id: number): Promise<BrandTranslationResponseType | null> {
    return this.prismaService.brandTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(payload: {
    userId: number;
    body: CreateBrandTranslationBodyType;
  }): Promise<BrandTranslationResponseType> {
    const { userId, body } = payload;
    return this.prismaService.brandTranslation.create({
      data: {
        brandId: body.brandId,
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
    body: UpdateBrandTranslationBodyType;
  }): Promise<BrandTranslationResponseType> {
    const { id, userId, body } = payload;
    return this.prismaService.brandTranslation.update({
      where: {
        id,
      },
      data: {
        brandId: body.brandId,
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
  ): Promise<BrandTranslationResponseType> {
    const { id, userId } = payload;
    return isHardDelete
      ? this.prismaService.brandTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.brandTranslation.update({
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
