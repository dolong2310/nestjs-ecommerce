import { CreateRoleBodyType, GetRolesResponseType, RoleQueryType, RoleWithPermissionsType, UpdateRoleBodyType } from "@/routes/role/role.type";
import { PrismaService } from "@/shared/services/prisma.service";
import { RoleType } from "@/shared/types/shared-role.type";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) { }

  // For offset-based pagination
  async findAll({ page, limit }: RoleQueryType): Promise<GetRolesResponseType> {
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
  // async findAll({ cursor, limit }: RoleQueryType): Promise<GetRolesResponseType> {
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
        permissions: true,
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
        permissions: true, // tạo mới thì vẫn trả về permissions nhưng là [] rỗng
      },
    })
  }

  update(payload: { userId: number, id: number, body: UpdateRoleBodyType }): Promise<RoleWithPermissionsType> {
    const { userId, id, body } = payload;
    return this.prisma.role.update({
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
        permissions: true,
      },
    })
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