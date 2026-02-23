import { CouponController } from '@/routes/coupon/coupon.controller';
import { CouponRepository } from '@/routes/coupon/coupon.repo';
import { CouponService } from '@/routes/coupon/coupon.service';
import { ManageCouponController } from '@/routes/coupon/manage-coupon.controller';
import { ManageCouponService } from '@/routes/coupon/manage-coupon.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ManageCouponController, CouponController],
  providers: [CouponRepository, ManageCouponService, CouponService],
})
export class CouponModule {}
