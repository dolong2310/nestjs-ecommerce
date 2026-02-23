import {
  CouponActiveAndHasOrdersException,
  CouponCodeAlreadyExistsException,
  CouponNotAllowedException,
  CouponNotOwnedException,
  NotFoundCouponException,
} from '@/routes/coupon/coupon.error';
import { CouponRepository } from '@/routes/coupon/coupon.repo';
import {
  CreateCouponBodyType,
  GetCouponResponseType,
  GetCouponsQueryType,
  GetCouponsResponseType,
  UpdateCouponBodyType,
} from '@/routes/coupon/coupon.type';
import { EnumCouponStatus } from '@/shared/constants/coupon.constant';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManageCouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  getCoupons({
    roleName,
    query,
  }: {
    roleName: RoleNameType;
    query: GetCouponsQueryType;
  }): Promise<GetCouponsResponseType> {
    this._validateSellerOrAdmin(roleName);
    return this.couponRepository.findMany(query);
  }

  async getCoupon(id: number): Promise<GetCouponResponseType> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw NotFoundCouponException;
    }
    return coupon;
  }

  async createCoupon({
    userId,
    roleName,
    body,
  }: {
    userId: number;
    roleName: RoleNameType;
    body: CreateCouponBodyType;
  }): Promise<GetCouponResponseType> {
    try {
      // Kiểm tra role: chỉ cho phép Admin và Seller tạo coupon
      this._validateSellerOrAdmin(roleName);
      return await this.couponRepository.create({ userId, body });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CouponCodeAlreadyExistsException;
      }
      throw error;
    }
  }

  async updateCoupon({
    userId,
    roleName,
    id,
    body,
  }: {
    userId: number;
    roleName: RoleNameType;
    id: number;
    body: UpdateCouponBodyType;
  }): Promise<GetCouponResponseType> {
    try {
      this._validateSellerOrAdmin(roleName);
      await this._validateCoupon({ userId, roleName, id });
      return await this.couponRepository.update({ userId, id, body });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CouponCodeAlreadyExistsException;
      }
      throw error;
    }
  }

  async deleteCoupon({
    userId,
    roleName,
    id,
  }: {
    userId: number;
    roleName: RoleNameType;
    id: number;
  }): Promise<MessageResponseType> {
    try {
      this._validateSellerOrAdmin(roleName);
      await this._validateCoupon({ userId, roleName, id });
      await this.couponRepository.delete({ userId, id });
      return {
        message: 'Success.CouponDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundCouponException;
      }
      throw error;
    }
  }

  private async _validateCoupon({
    userId,
    roleName,
    id,
  }: {
    userId: number;
    roleName: RoleNameType;
    id: number;
  }): Promise<void> {
    const coupon = await this.couponRepository.findByIdIncludeOrders(id);

    if (!coupon) {
      throw NotFoundCouponException;
    }

    // Kiểm tra ownership (Nếu role là Admin: bỏ qua check ownership)
    if (roleName === RoleName.SELLER && coupon.createdById !== userId) {
      throw CouponNotOwnedException;
    }

    // Không cho phép sửa coupon đang active và đã có orders dùng — nếu coupon đã được dùng thì chỉ nên cho phép sửa isActive/status, không sửa discount, discountType, minOrderAmount (tránh inconsistency với các order đã tạo)
    if (coupon.status === EnumCouponStatus.ACTIVE && coupon._count.orders > 0) {
      throw CouponActiveAndHasOrdersException;
    }
  }

  private _validateSellerOrAdmin(roleName: RoleNameType): void {
    if (roleName !== RoleName.SELLER && roleName !== RoleName.ADMIN) {
      throw CouponNotAllowedException;
    }
  }
}
