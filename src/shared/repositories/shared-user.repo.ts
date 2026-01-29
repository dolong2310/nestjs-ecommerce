import { PrismaService } from "@/shared/services/prisma.service";
import { PermissionType } from "@/shared/types/shared-permission.type";
import { RoleType } from "@/shared/types/shared-role.type";
import type { UserType } from "@/shared/types/shared-user.type";
import { Injectable } from "@nestjs/common";

type WhereUniqueInputType = { id: number, [key: string]: any } | { email: string, [key: string]: any };
type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } };

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  findUnique(where: WhereUniqueInputType): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where,
    });
  }

  findUniqueIncludeRolePermissions(where: WhereUniqueInputType): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findUnique({
      where,
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

  update(where: WhereUniqueInputType, data: Partial<UserType>): Promise<UserType | null> {
    return this.prismaService.user.update({
      where,
      data,
    });
  }
}
