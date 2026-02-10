import {
  BrandIncludeTranslationsResponseType,
  BrandType,
  CreateBrandBodyType,
  GetBrandsIncludeTranslationsResponseType,
  GetBrandsQueryType,
  UpdateBrandBodyType,
} from '@/routes/brand/brand.type';
import { translationWhere } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(
    { page, limit }: GetBrandsQueryType,
    languageId: string,
  ): Promise<GetBrandsIncludeTranslationsResponseType> {
    const totalBrandsPromise = this.prismaService.brand.count({
      where: {
        deletedAt: null,
      },
    });
    const brandsPromise = this.prismaService.brand.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        brandTranslations: {
          where: translationWhere(languageId),
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    const [brands, totalBrands] = await Promise.all([brandsPromise, totalBrandsPromise]);
    return {
      data: brands,
      totalItems: totalBrands,
      totalPages: Math.ceil(totalBrands / limit),
      currentPage: page,
      limit: limit,
    };
  }

  findOne(id: number, languageId: string): Promise<BrandIncludeTranslationsResponseType | null> {
    return this.prismaService.brand.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        brandTranslations: {
          where: translationWhere(languageId),
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  create(payload: { userId: number; body: CreateBrandBodyType }): Promise<BrandIncludeTranslationsResponseType> {
    return this.prismaService.brand.create({
      data: {
        logo: payload.body.logo,
        name: payload.body.name,
        createdById: payload.userId,
      },
      include: {
        brandTranslations: {
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
    body: UpdateBrandBodyType;
  }): Promise<BrandIncludeTranslationsResponseType> {
    return this.prismaService.brand.update({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      data: {
        logo: payload.body.logo,
        name: payload.body.name,
        updatedById: payload.userId,
      },
      include: {
        brandTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  delete(payload: { userId: number; id: number }, isHardDelete?: boolean): Promise<BrandType> {
    return isHardDelete
      ? this.prismaService.brand.delete({
          where: {
            id: payload.id,
          },
        })
      : this.prismaService.brand.update({
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
