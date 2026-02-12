import { CreateUserBodyType, GetUsersResponseType, UserQueryType } from '@/routes/user/user.type';
import { paginate } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import type { UserType } from '@/shared/types/shared-user.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // For offset-based pagination
  async findMany({ page, limit }: UserQueryType): Promise<GetUsersResponseType> {
    const usersPromise = this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        deletedAt: null,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      omit: {
        password: true,
        totpSecret: true,
      },
      orderBy: {
        id: 'asc', // Giúp database dùng index hiệu quả
      },
    });
    const totalUsersPromise = this.prisma.user.count({
      where: {
        deletedAt: null,
      },
    });
    return await paginate(usersPromise, totalUsersPromise, page, limit);
  }

  create(payload: { userId: number; body: CreateUserBodyType }): Promise<UserType> {
    const { userId, body } = payload;
    return this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: body.password,
        phoneNumber: body.phoneNumber,
        avatar: body.avatar,
        roleId: body.roleId,
        status: body.status,
        createdById: userId,
      },
    });
  }

  delete(payload: { userId: number; id: number }, isHardDelete?: boolean): Promise<UserType> {
    const { userId, id } = payload;
    return isHardDelete
      ? this.prisma.user.delete({
          where: {
            id,
          },
        })
      : this.prisma.user.update({
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
