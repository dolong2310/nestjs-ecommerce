import { EnumPaymentStatus } from '@/shared/constants/payment.constant';
import { stringToDate } from '@/shared/models/codecs';
import z from 'zod';

export const PaymentSchema = z.object({
  id: z.number(),
  status: z.enum(EnumPaymentStatus),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
});
