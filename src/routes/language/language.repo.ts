import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from '@/routes/language/language.type';
import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany(): Promise<LanguageType[]> {
    return this.prismaService.language.findMany({
      where: { deletedAt: null },
    });
  }

  findById(id: string): Promise<LanguageType | null> {
    return this.prismaService.language.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  create(payload: { userId: number; body: CreateLanguageBodyType }): Promise<LanguageType> {
    const { userId, body } = payload;
    return this.prismaService.language.create({
      data: {
        id: body.id,
        name: body.name,
        createdById: userId,
      },
    });
  }

  update(payload: { id: string; userId: number; body: UpdateLanguageBodyType }): Promise<LanguageType> {
    const { id, userId, body } = payload;
    return this.prismaService.language.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: body.name,
        updatedById: userId,
      },
    });
  }

  delete(payload: { userId: number; id: string }, isHardDelete?: boolean): Promise<LanguageType> {
    const { userId, id } = payload;
    return isHardDelete
      ? this.prismaService.language.delete({
          where: {
            id,
          },
        })
      : this.prismaService.language.update({
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
