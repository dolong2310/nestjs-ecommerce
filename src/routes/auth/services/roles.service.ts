import { RoleNotFoundException } from '@/routes/role/role.error';
import { RoleName } from '@/shared/constants/role.constant';
import { PrismaService } from '@/shared/services/prisma.service';
import { RoleType } from '@/shared/types/shared-role.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesService {
  private userRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) { }

  async getUserRoleId(): Promise<number> {
    // if user role id is cached, return it
    if (this.userRoleId) {
      return this.userRoleId;
    }

    try {
      // Cách 1: Dùng raw query
      const userRole: RoleType = await this.prismaService.$queryRaw`
        SELECT * FROM "Role" WHERE name = ${RoleName.User} AND "deletedAt" IS NULL LIMIT 1;
      `.then((res: RoleType[]) => {
        // findFirstOrThrow
        if (res.length === 0) {
          throw RoleNotFoundException;
        }
        return res[0];
      })

      // Cách 2: Dùng findFirstOrThrow
      // const userRole = await this.prismaService.role.findFirstOrThrow({
      //   where: {
      //     name: RoleName.User,
      //   },
      // });

      // cache user role id
      this.userRoleId = userRole.id;

      return userRole.id;
    } catch (error) {
      throw error;
    }
  }
}
