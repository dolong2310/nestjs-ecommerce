import { Prisma } from '@/generated/prisma/client';
import {
  CreateCouponBodyType,
  GetCouponIncludeOrdersCountResponseType,
  GetCouponsQueryType,
  GetCouponsResponseType,
  UpdateCouponBodyType,
} from '@/routes/coupon/coupon.type';
import { EnumCouponStatus } from '@/shared/constants/coupon.constant';
import { paginate } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { GetCouponResponseType } from '@/shared/types/shared-coupon.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CouponRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany(query: GetCouponsQueryType): Promise<GetCouponsResponseType> {
    // Admin/Seller: xem tất cả
    // query: status, startDate, endDate để Admin/Seller có thể search
    const { startDate, endDate, status, page, limit } = query;

    const where: Prisma.CouponWhereInput = {
      deletedAt: null,
    };

    if (startDate) {
      where.startDate = { gte: startDate };
    }

    if (endDate) {
      where.endDate = { lte: endDate };
    }

    if (status) {
      where.status = status;
    }

    const totalCouponsPromise = this.prismaService.coupon.count({
      where,
    });

    const couponsPromise = this.prismaService.coupon.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(couponsPromise, totalCouponsPromise, page, limit);
  }

  findById(id: number): Promise<GetCouponResponseType | null> {
    return this.prismaService.coupon.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  findManyPublicUser(query: GetCouponsQueryType): Promise<GetCouponsResponseType> {
    // Public/User: chỉ xem coupon status = ACTIVE, chưa hết hạn (endDate > now()), đã bắt đầu (startDate <= now()), còn quantity > 0
    const { page, limit } = query;

    const where: Prisma.CouponWhereInput = {
      deletedAt: null,
      endDate: {
        gt: new Date(), // chưa hết hạn
      },
      startDate: {
        lte: new Date(), // đã bắt đầu
      },
      quantity: {
        gt: 0, // còn quantity > 0
      },
      status: EnumCouponStatus.ACTIVE,
    };

    const totalCouponsPromise = this.prismaService.coupon.count({
      where,
    });

    const couponsPromise = this.prismaService.coupon.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(couponsPromise, totalCouponsPromise, page, limit);
  }

  findByIdPublicUser(id: number): Promise<GetCouponResponseType | null> {
    // Public/User: chỉ xem coupon status = ACTIVE, chưa hết hạn (endDate > now()), đã bắt đầu (startDate <= now()), còn quantity > 0
    return this.prismaService.coupon.findUnique({
      where: {
        id,
        deletedAt: null,
        endDate: {
          gt: new Date(), // chưa hết hạn
        },
        startDate: {
          lte: new Date(), // đã bắt đầu
        },
        quantity: {
          gt: 0, // còn quantity > 0
        },
        status: EnumCouponStatus.ACTIVE,
      },
    });
  }

  findByIdIncludeOrders(id: number): Promise<GetCouponIncludeOrdersCountResponseType | null> {
    return this.prismaService.coupon.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });
  }

  create({ userId, body }: { userId: number; body: CreateCouponBodyType }): Promise<GetCouponResponseType> {
    return this.prismaService.coupon.create({
      data: {
        code: body.code,
        discount: body.discount,
        quantity: body.quantity,
        minOrderAmount: body.minOrderAmount,
        startDate: body.startDate,
        endDate: body.endDate,
        discountType: body.discountType,
        status: body.status,
        createdById: userId,
      },
    });
  }

  update({
    userId,
    id,
    body,
  }: {
    userId: number;
    id: number;
    body: UpdateCouponBodyType;
  }): Promise<GetCouponResponseType> {
    return this.prismaService.coupon.update({
      where: { id, deletedAt: null },
      data: {
        code: body.code,
        discount: body.discount,
        quantity: body.quantity,
        minOrderAmount: body.minOrderAmount,
        startDate: body.startDate,
        endDate: body.endDate,
        discountType: body.discountType,
        status: body.status,
        updatedById: userId,
      },
    });
  }

  // Khi hard delete một coupon, Order.couponId sẽ bị set NULL (do onDelete: SetNull trong schema).
  // Các order này đã được tạo với discount từ coupon đó, nhưng giờ không còn reference nào để biết đã dùng coupon gì → mất audit trail.
  // Nên luôn dùng soft delete cho coupon.
  delete({ userId, id }: { userId: number; id: number }): Promise<GetCouponResponseType> {
    return this.prismaService.coupon.update({
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
