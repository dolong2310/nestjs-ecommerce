import { RoleName } from '@/shared/constants/role.constant';
import { PrismaService } from '@/shared/services/prisma.service';
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
      const userRole = await this.prismaService.role.findFirstOrThrow({
        where: {
          name: RoleName.User,
        },
      });

      // cache user role id
      this.userRoleId = userRole.id;

      return userRole.id;
    } catch (error) {
      throw error;
    }
  }
}
