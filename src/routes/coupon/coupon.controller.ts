import {
  GetCouponParamsDTO,
  GetCouponResponseDTO,
  GetCouponsPublicUserQueryDTO,
  GetCouponsResponseDTO,
} from '@/routes/coupon/coupon.dto';
import { CouponService } from '@/routes/coupon/coupon.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { Public } from '@/shared/decorators/auth.decorator';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Public()
@Controller({ path: 'coupons', version: CURRENT_VERSION })
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @ZodResponse({ type: GetCouponsResponseDTO })
  getCoupons(@Query() query: GetCouponsPublicUserQueryDTO): Promise<GetCouponsResponseDTO> {
    return this.couponService.getCouponsPublicUser(query);
  }

  @Get(':id')
  @ZodResponse({ type: GetCouponResponseDTO })
  getCoupon(@Param() params: GetCouponParamsDTO): Promise<GetCouponResponseDTO> {
    return this.couponService.getCouponPublicUser(params.id);
  }
}
