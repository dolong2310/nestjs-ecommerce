import { OrderIncludeProductSkuSnapshotSchema, OrderSchema } from '@/shared/models/shared-order.model';
import z from 'zod';

export type OrderType = z.infer<typeof OrderSchema>;
export type OrderIncludeProductSkuSnapshotType = z.infer<typeof OrderIncludeProductSkuSnapshotSchema>;
