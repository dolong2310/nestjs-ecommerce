export const EnumCouponDiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;

export const EnumCouponStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
} as const;

export type CouponDiscountTypeType = (typeof EnumCouponDiscountType)[keyof typeof EnumCouponDiscountType];
export type CouponStatusType = (typeof EnumCouponStatus)[keyof typeof EnumCouponStatus];
