import { PaymentSchema } from '@/shared/models/shared-payment.model';
import { OrderIncludeProductSkuSnapshotType } from '@/shared/types/shared-order.type';
import z from 'zod';

export type PaymentType = z.infer<typeof PaymentSchema>;
export type PaymentIncludeOrdersType = PaymentType & {
  orders: OrderIncludeProductSkuSnapshotType[];
};
