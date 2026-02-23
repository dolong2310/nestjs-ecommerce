import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { stringToDate } from '@/shared/models/codecs';
import z from 'zod';

export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number().int().positive(),
  shopId: z.number().nullable(),
  paymentId: z.number(),
  couponId: z.number().nullable(),
  status: z.enum(EnumOrderStatus),
  receiver: z.object({
    name: z.string(),
    phoneNumber: z.string(),
    address: z.string(),
  }),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: stringToDate.nullable(),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
});

export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productId: z.number().nullable(),
  productName: z.string().max(500),
  image: z.string(),
  productTranslations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      languageId: z.string(),
    }),
  ),
  quantity: z.number().min(0),
  orderId: z.number().nullable(),
  skuId: z.number().nullable(),
  skuPrice: z.number().min(0),
  skuValue: z.string().max(500),
  createdAt: stringToDate.default(new Date()),
});

export const OrderIncludeProductSkuSnapshotSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
});
