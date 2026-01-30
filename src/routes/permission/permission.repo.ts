import {
  CreatePermissionBodyType,
  GetPermissionsResponseType,
  PermissionQueryType,
  UpdatePermissionBodyType,
} from '@/routes/permission/permission.type';
import { PrismaService } from '@/shared/services/prisma.service';
import type { PermissionType } from '@/shared/types/shared-permission.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  // For offset-based pagination
  async findMany({ page, limit }: PermissionQueryType): Promise<GetPermissionsResponseType> {
    const permissionsPromise = this.prisma.permission.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        deletedAt: null,
      },
      orderBy: {
        id: 'asc', // Giúp database dùng index hiệu quả
      },
    });
    const totalPermissionsPromise = this.prisma.permission.count({
      where: {
        deletedAt: null,
      },
    });
    const [permissions, totalPermissions] = await Promise.all([permissionsPromise, totalPermissionsPromise]);
    return {
      data: permissions,
      totalItems: totalPermissions,
      totalPages: Math.ceil(totalPermissions / limit),
      currentPage: page,
      limit: limit,
    };
  }

  // For cursor-based pagination
  // async findMany({ cursor, limit }: PermissionQueryType): Promise<GetPermissionsResponseType> {
  //   // Lấy thêm 1 record để kiểm tra có page tiếp theo không
  //   const permissions = await this.prisma.permission.findMany({
  //     take: limit + 1, // Lấy thêm 1 để check hasNextPage
  //     skip: cursor ? 1 : 0, // Nếu có cursor thì skip chính cursor đó (vì cursor là record cuối cùng của page trước)
  //     cursor: cursor ? { id: cursor } : undefined, // Bắt đầu từ cursor
  //     where: {
  //       deletedAt: null,
  //     },
  //     orderBy: {
  //       id: 'asc', // QUAN TRỌNG: phải có orderBy để cursor hoạt động đúng
  //     }
  //   });

  //   // Kiểm tra có page tiếp theo không
  //   const hasNextPage = permissions.length > limit;

  //   // Nếu có nhiều hơn limit thì remove record cuối
  //   const data = hasNextPage ? permissions.slice(0, -1) : permissions;

  //   // nextCursor là ID của record cuối cùng trong data
  //   const nextCursor = data.length > 0 ? data[data.length - 1].id : null;

  //   return {
  //     data,
  //     nextCursor,
  //     hasNextPage,
  //     limit,
  //   }
  // }

  findOne(id: number): Promise<PermissionType | null> {
    return this.prisma.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  create(payload: { userId: number; body: CreatePermissionBodyType }): Promise<PermissionType> {
    const { userId, body } = payload;
    return this.prisma.permission.create({
      data: {
        name: body.name,
        description: body.description,
        path: body.path,
        method: body.method,
        createdById: userId,
      },
    });
  }

  update(payload: { userId: number; id: number; body: UpdatePermissionBodyType }): Promise<PermissionType> {
    const { userId, id, body } = payload;
    return this.prisma.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: body.name,
        description: body.description,
        path: body.path,
        method: body.method,
        updatedById: userId,
      },
    });
  }

  delete(payload: { userId: number; id: number }, isHardDelete?: boolean): Promise<PermissionType> {
    const { userId, id } = payload;
    return isHardDelete
      ? this.prisma.permission.delete({
          where: {
            id,
          },
        })
      : this.prisma.permission.update({
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
