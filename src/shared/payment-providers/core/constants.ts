/**
 * Payment Method Enum
 */
export const EnumPaymentMethod = {
  VNPAY: 'vnpay',
  MOMO: 'momo',
} as const;

export type PaymentMethod = (typeof EnumPaymentMethod)[keyof typeof EnumPaymentMethod];
