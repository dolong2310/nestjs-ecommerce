import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from "@/routes/language/language.type";
import { PrismaService } from "@/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) { }

  findAll(): Promise<LanguageType[]> {
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

  create(data: { createdById: number, body: CreateLanguageBodyType }): Promise<LanguageType> {
    return this.prismaService.language.create({
      data: {
        id: data.body.id,
        name: data.body.name,
        createdById: data.createdById,
      },
    });
  }

  update(data: { id: string, updatedById: number, body: UpdateLanguageBodyType }): Promise<LanguageType> {
    return this.prismaService.language.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        name: data.body.name,
        updatedById: data.updatedById,
      },
    });
  }

  delete(data: { id: string, isHard?: boolean }): Promise<LanguageType> {
    return data.isHard
      ? this.prismaService.language.delete({
        where: {
          id: data.id,
          deletedAt: null,
        },
      })
      : this.prismaService.language.update({
        where: {
          id: data.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
  }
}