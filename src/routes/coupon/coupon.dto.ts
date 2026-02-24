import {
  CreateCouponBodySchema,
  GetCouponIncludeOrdersCountResponseSchema,
  GetCouponParamsSchema,
  GetCouponsPublicUserQuerySchema,
  GetCouponsQuerySchema,
  GetCouponsResponseSchema,
  UpdateCouponBodySchema,
} from '@/routes/coupon/coupon.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';
import { GetCouponResponseSchema } from '@/shared/models/shared-coupon.model';

export class GetCouponsQueryDTO extends createRequestDto(GetCouponsQuerySchema) {}
export class GetCouponsPublicUserQueryDTO extends createRequestDto(GetCouponsPublicUserQuerySchema) {}
export class GetCouponParamsDTO extends createRequestDto(GetCouponParamsSchema) {}
export class CreateCouponBodyDTO extends createRequestDto(CreateCouponBodySchema) {}
export class UpdateCouponBodyDTO extends createRequestDto(UpdateCouponBodySchema) {}

export class GetCouponsResponseDTO extends createResponseDto(GetCouponsResponseSchema) {}
export class GetCouponResponseDTO extends createResponseDto(GetCouponResponseSchema) {}
export class GetCouponIncludeOrdersCountResponseDTO extends createResponseDto(GetCouponIncludeOrdersCountResponseSchema) {}
