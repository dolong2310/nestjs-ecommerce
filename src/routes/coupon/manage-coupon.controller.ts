import {
  CreateCouponBodyDTO,
  GetCouponParamsDTO,
  GetCouponResponseDTO,
  GetCouponsQueryDTO,
  GetCouponsResponseDTO,
  UpdateCouponBodyDTO,
} from '@/routes/coupon/coupon.dto';
import { ManageCouponService } from '@/routes/coupon/manage-coupon.service';
import type { RoleNameType } from '@/shared/constants/role.constant';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import type { AccessTokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'manage-coupon/coupons', version: CURRENT_VERSION })
export class ManageCouponController {
  constructor(private readonly manageCouponService: ManageCouponService) {}

  @Get()
  @ZodResponse({ type: GetCouponsResponseDTO })
  getCoupons(
    @Query() query: GetCouponsQueryDTO,
    @ActiveUser('roleName') roleName: RoleNameType,
  ): Promise<GetCouponsResponseDTO> {
    return this.manageCouponService.getCoupons({ roleName, query });
  }

  @Get(':id')
  @ZodResponse({ type: GetCouponResponseDTO })
  getCoupon(@Param() params: GetCouponParamsDTO): Promise<GetCouponResponseDTO> {
    return this.manageCouponService.getCoupon(params.id);
  }

  @Post()
  @ZodResponse({ type: GetCouponResponseDTO })
  createCoupon(
    @Body() body: CreateCouponBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<GetCouponResponseDTO> {
    const { userId, roleName } = user;
    return this.manageCouponService.createCoupon({ userId, roleName, body });
  }

  @Put(':id')
  @ZodResponse({ type: GetCouponResponseDTO })
  updateCoupon(
    @Param() params: GetCouponParamsDTO,
    @Body() body: UpdateCouponBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<GetCouponResponseDTO> {
    const { userId, roleName } = user;
    return this.manageCouponService.updateCoupon({ userId, roleName, id: params.id, body });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deleteCoupon(
    @Param() params: GetCouponParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<MessageResponseDTO> {
    const { userId, roleName } = user;
    return this.manageCouponService.deleteCoupon({ userId, roleName, id: params.id });
  }
}
