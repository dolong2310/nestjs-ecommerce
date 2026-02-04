export const PREFIX_PAYMENT_CODE = 'DH';

export const EnumPaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export type PaymentStatusType = (typeof EnumPaymentStatus)[keyof typeof EnumPaymentStatus];
