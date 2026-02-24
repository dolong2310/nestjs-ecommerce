import { EnumCouponDiscountType, EnumCouponStatus } from '@/shared/constants/coupon.constant';
import { timestampToDate } from '@/shared/models/codecs';
import { PaginationQuerySchema } from '@/shared/models/request.model';
import { createPaginationResponseSchema } from '@/shared/models/response.model';
import { CouponSchema } from '@/shared/models/shared-coupon.model';
import z from 'zod';

// Request query
export const GetCouponsQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(EnumCouponStatus).optional(),
  startDate: z.preprocess((value) => Number(value), timestampToDate.optional()),
  endDate: z.preprocess((value) => Number(value), timestampToDate.optional()),
}).strict();

export const GetCouponsPublicUserQuerySchema = PaginationQuerySchema.strict();

// Request params
export const GetCouponParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

// Request body
export const CreateCouponBodySchema = CouponSchema.pick({
  code: true,
  discount: true,
  quantity: true,
  minOrderAmount: true,
  startDate: true,
  endDate: true,
  discountType: true,
  status: true,
})
  .strict()
  .superRefine((data, ctx) => {
    const { startDate, endDate, discount, minOrderAmount, discountType } = data;
    // validate startDate < endDate
    if (startDate && endDate && startDate > endDate) {
      ctx.addIssue({
        code: 'custom',
        field: 'startDate',
        message: 'Start date must be before end date',
      });
    }

    // validate minOrderAmount > 0
    if (typeof minOrderAmount !== 'undefined' && minOrderAmount <= 0) {
      ctx.addIssue({
        code: 'custom',
        field: 'minOrderAmount',
        message: 'Min order amount must be greater than 0',
      });
    }

    // Nếu PERCENTAGE: discount phải trong khoảng 1–100
    if (
      discountType === EnumCouponDiscountType.PERCENTAGE &&
      typeof discount !== 'undefined' &&
      (discount <= 0 || discount > 100) // discount must be between 0 and 100
    ) {
      ctx.addIssue({
        code: 'custom',
        field: 'discount',
        message: 'Discount must be between 0 and 100',
      });
    }

    // Nếu FIXED_AMOUNT: discount > 0 và discount < minOrderAmount (không hợp lý khi giảm nhiều hơn giá trị đơn tối thiểu)
    if (
      discountType === EnumCouponDiscountType.FIXED_AMOUNT &&
      typeof discount !== 'undefined' &&
      (discount <= 0 || discount > minOrderAmount)
    ) {
      ctx.addIssue({
        code: 'custom',
        field: 'discount',
        message: 'Discount must be greater than 0 and less than min order amount',
      });
    }
  });

export const UpdateCouponBodySchema = CreateCouponBodySchema;

// Response
export const GetCouponsResponseSchema = createPaginationResponseSchema(
  CouponSchema.omit({
    createdById: true,
    updatedById: true,
  }),
);

export const GetCouponIncludeOrdersCountResponseSchema = CouponSchema.extend({
  _count: z.object({
    orders: z.number(),
  }),
  // orders: z.array(
  //   OrderSchema.omit({
  //     createdById: true,
  //     updatedById: true,
  //     deletedById: true,
  //     deletedAt: true,
  //   }),
  // ),
});
