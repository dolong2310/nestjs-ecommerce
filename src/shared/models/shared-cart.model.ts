import { stringToDate } from '@/shared/models/codecs';
import { ProductTranslationSchema } from '@/shared/models/shared-product-translation.model';
import { ProductSchema } from '@/shared/models/shared-product.model';
import { SkuSchema } from '@/shared/models/shared-sku.model';
import z from 'zod';

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number().min(0),
  skuId: z.number().int().positive(),
  userId: z.number().int().positive(),

  createdAt: stringToDate.default(new Date()), // trong cart.service nếu dùng hàm findMany2 thì phải dùng coerce ép kiểu từ string qua date => không thì lỗi zod serialize
  updatedAt: stringToDate.default(new Date()), // trong cart.service nếu dùng hàm findMany2 thì phải dùng coerce ép kiểu từ string qua date => không thì lỗi zod serialize
  // createdAt: z.coerce.date().default(new Date()), // trong cart.service nếu dùng hàm findMany2 thì phải dùng coerce ép kiểu từ string qua date => không thì lỗi zod serialize
  // updatedAt: z.coerce.date().default(new Date()), // trong cart.service nếu dùng hàm findMany2 thì phải dùng coerce ép kiểu từ string qua date => không thì lỗi zod serialize
});

export const CartItemIncludeSkuAndProductSchema = CartItemSchema.extend({
  sku: SkuSchema.extend({
    product: ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  }),
});
