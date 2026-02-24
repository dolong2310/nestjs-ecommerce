import { NotFoundCouponException } from '@/routes/coupon/coupon.error';
import { CouponRepository } from '@/routes/coupon/coupon.repo';
import { GetCouponsPublicUserQueryType, GetCouponsResponseType } from '@/routes/coupon/coupon.type';
import { GetCouponResponseType } from '@/shared/types/shared-coupon.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  getCouponsPublicUser(query: GetCouponsPublicUserQueryType): Promise<GetCouponsResponseType> {
    return this.couponRepository.findManyPublicUser(query);
  }

  async getCouponPublicUser(id: number): Promise<GetCouponResponseType> {
    const coupon = await this.couponRepository.findByIdPublicUser(id);
    if (!coupon) {
      throw NotFoundCouponException;
    }
    return coupon;
  }
}
