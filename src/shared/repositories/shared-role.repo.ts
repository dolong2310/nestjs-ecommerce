import { RoleNotFoundException } from '@/routes/role/role.error';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
import { PrismaService } from '@/shared/services/prisma.service';
import { RoleType } from '@/shared/types/shared-role.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SharedRoleRepository {
  private userRoleId: number | null = null;
  private adminRoleId: number | null = null;
  private sellerRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  async getAdminRoleId(): Promise<number> {
    // if role id is cached, return it
    if (this.adminRoleId) {
      return this.adminRoleId;
    }

    try {
      const role = await this._getRole(RoleName.Admin);
      this.adminRoleId = role.id; // cache role id
      return role.id;
    } catch (error) {
      throw error;
    }
  }

  async getUserRoleId(): Promise<number> {
    // if role id is cached, return it
    if (this.userRoleId) {
      return this.userRoleId;
    }

    try {
      const role = await this._getRole(RoleName.User);
      this.userRoleId = role.id; // cache role id
      return role.id;
    } catch (error) {
      throw error;
    }
  }

  async getSellerRoleId(): Promise<number> {
    // if role id is cached, return it
    if (this.sellerRoleId) {
      return this.sellerRoleId;
    }

    try {
      const role = await this._getRole(RoleName.Seller);
      this.sellerRoleId = role.id; // cache role id
      return role.id;
    } catch (error) {
      throw error;
    }
  }

  private async _getRole(roleName: RoleNameType): Promise<RoleType> {
    // Cách 1: Dùng raw query
    const role: RoleType = await this.prismaService.$queryRaw`
      SELECT * FROM "Role" WHERE name = ${roleName} AND "deletedAt" IS NULL LIMIT 1;
      `.then((res: RoleType[]) => {
      // findFirstOrThrow
      if (res.length === 0) {
        throw RoleNotFoundException;
      }
      return res[0];
    });

    // Cách 2: Dùng findFirstOrThrow
    // const role = await this.prismaService.role.findFirstOrThrow({
    //   where: {
    //     name: roleName,
    //     deletedAt: null,
    //   },
    // });

    return role;
  }
}
