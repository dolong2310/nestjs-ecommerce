import { PrismaService } from "@/shared/services/prisma.service";
import { PermissionType } from "@/shared/types/shared-permission.type";
import { RoleType } from "@/shared/types/shared-role.type";
import type { UserType } from "@/shared/types/shared-user.type";
import { Injectable } from "@nestjs/common";

export type WhereUniqueInputType = { id: number } | { email: string };
export type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } };

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  findUnique(where: WhereUniqueInputType): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
    });
    // return this.prismaService.user.findUnique({
    //   where,
    // });
  }

  findUniqueIncludeRolePermissions(where: WhereUniqueInputType): Promise<UserIncludeRolePermissionsType | null> {
    // findUnique => findFirst
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  update(where: { id: number }, data: Partial<Omit<UserType, 'id'>>): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    });
  }
}
