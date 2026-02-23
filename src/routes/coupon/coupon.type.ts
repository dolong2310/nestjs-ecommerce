import {
  CreateCouponBodySchema,
  GetCouponIncludeOrdersCountResponseSchema,
  GetCouponParamsSchema,
  GetCouponResponseSchema,
  GetCouponsPublicUserQuerySchema,
  GetCouponsQuerySchema,
  GetCouponsResponseSchema,
  UpdateCouponBodySchema,
} from '@/routes/coupon/coupon.model';
import z from 'zod';

export type GetCouponsQueryType = z.infer<typeof GetCouponsQuerySchema>;
export type GetCouponsPublicUserQueryType = z.infer<typeof GetCouponsPublicUserQuerySchema>;
export type GetCouponParamsType = z.infer<typeof GetCouponParamsSchema>;
export type CreateCouponBodyType = z.infer<typeof CreateCouponBodySchema>;
export type UpdateCouponBodyType = z.infer<typeof UpdateCouponBodySchema>;

export type GetCouponsResponseType = z.infer<typeof GetCouponsResponseSchema>;
export type GetCouponResponseType = z.infer<typeof GetCouponResponseSchema>;
export type GetCouponIncludeOrdersCountResponseType = z.infer<typeof GetCouponIncludeOrdersCountResponseSchema>;
