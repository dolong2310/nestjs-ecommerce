import { CreateRoleBodyType, GetRolesResponseType, RoleQueryType, UpdateRoleBodyType } from "@/routes/role/role.type";
import { PrismaService } from "@/shared/services/prisma.service";
import { RoleType, RoleWithPermissionsType } from "@/shared/types/shared-role.type";
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) { }

  // For offset-based pagination
  async findMany({ page, limit }: RoleQueryType): Promise<GetRolesResponseType> {
    const rolesPromise = this.prisma.role.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        deletedAt: null,
      },
      orderBy: {
        id: 'asc', // Giúp database dùng index hiệu quả
      },
    });
    const totalRolesPromise = this.prisma.role.count({
      where: {
        deletedAt: null,
      }
    });
    const [roles, totalRoles] = await Promise.all([rolesPromise, totalRolesPromise]);
    return {
      data: roles,
      totalItems: totalRoles,
      totalPages: Math.ceil(totalRoles / limit),
      currentPage: page,
      limit: limit,
    }
  }

  // For cursor-based pagination
  // async findMany({ cursor, limit }: RoleQueryType): Promise<GetRolesResponseType> {
  //   // Lấy thêm 1 record để kiểm tra có page tiếp theo không
  //   const roles = await this.prisma.role.findMany({
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
  //   const hasNextPage = roles.length > limit;

  //   // Nếu có nhiều hơn limit thì remove record cuối
  //   const data = hasNextPage ? roles.slice(0, -1) : roles;

  //   // nextCursor là ID của record cuối cùng trong data
  //   const nextCursor = data.length > 0 ? data[data.length - 1].id : null;

  //   return {
  //     data,
  //     nextCursor,
  //     hasNextPage,
  //     limit,
  //   }
  // }

  findOne(id: number): Promise<RoleWithPermissionsType | null> {
    return this.prisma.role.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          }
        },
      },
    })
  }

  create(payload: { userId: number, body: CreateRoleBodyType }): Promise<RoleWithPermissionsType> {
    const { userId, body } = payload;
    return this.prisma.role.create({
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive,
        createdById: userId,
      },
      include: {
        // tạo mới thì vẫn trả về permissions nhưng là [] rỗng
        permissions: {
          where: {
            deletedAt: null,
          }
        },
      },
    })
  }

  async update(payload: { userId: number, id: number, body: UpdateRoleBodyType }): Promise<RoleWithPermissionsType> {
    const { userId, id, body } = payload;

    // kiểm tra xem list permissionIds có item nào đã soft delete hoặc không tồn tại thì không cho phép update
    if (body.permissionIds.length > 0) {
      // 1. lấy toàn bộ item của permissionIds từ db
      const permissions = await this.prisma.permission.findMany({
        where: {
          id: {
            in: body.permissionIds,
          }
        }
      });

      let notFoundIds: number[] = [];
      let deletedIds: number[] = [];

      // 2. Kiểm tra xem có permission nào không tồn tại không (số lượng tìm được < số lượng gửi lên)
      if (permissions.length !== body.permissionIds.length) {
        const foundIds = permissions.map(p => p.id);
        notFoundIds = body.permissionIds.filter(id => !foundIds.includes(id));
      }

      // 3. filter mảng permissions có item mà deletedAt: có giá trị new Date() => đã xoá
      const deletedPermissions = permissions.filter(p => p.deletedAt !== null);
      if (deletedPermissions.length > 0) {
        deletedIds = deletedPermissions.map(p => p.id);
      }

      // 4. Nếu có permission nào không tồn tại hoặc đã xoá thì không cho phép update
      if (notFoundIds.length > 0 || deletedIds.length > 0) {
        const errorObjects: { field: string, message: string, value: string }[] = [];
        if (notFoundIds.length > 0) {
          errorObjects.push({
            field: 'permissionIds',
            message: 'Error.PermissionNotFound',
            value: notFoundIds.join(', '),
          });
        }
        if (deletedIds.length > 0) {
          errorObjects.push({
            field: 'permissionIds',
            message: 'Error.PermissionDeleted',
            value: deletedIds.join(', '),
          });
        }
        throw new BadRequestException(errorObjects);
      }
    }

    return await this.prisma.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive,
        permissions: {
          set: body.permissionIds.map(id => ({ id })),
        },
        updatedById: userId,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          }
        },
      },
    });
  }

  delete(payload: { userId: number, id: number }, isHardDelete?: boolean): Promise<RoleType> {
    const { userId, id } = payload;
    return isHardDelete
      ? this.prisma.role.delete({
        where: {
          id,
        },
      })
      : this.prisma.role.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedById: userId,
        },
      })
  }
}