import { EnumCouponDiscountType, EnumCouponStatus } from '@/shared/constants/coupon.constant';
import { stringToDate, timestampToDate } from '@/shared/models/codecs';
import z from 'zod';

export const CouponSchema = z.object({
  id: z.number(),
  code: z.string().min(1).max(255),
  discount: z.number(),
  quantity: z.number().min(1),
  minOrderAmount: z.number(),
  startDate: timestampToDate,
  endDate: timestampToDate,
  discountType: z.enum(EnumCouponDiscountType),
  status: z.enum(EnumCouponStatus),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),

  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
});

export const GetCouponResponseSchema = CouponSchema.omit({
  createdById: true,
  updatedById: true,
});
