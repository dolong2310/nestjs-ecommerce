import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { PaginationQuerySchema } from '@/shared/models/request.model';
import z from 'zod';

export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number().int().positive(),
  status: z.enum(EnumOrderStatus),
  receiver: z.object({
    name: z.string(),
    phoneNumber: z.string(),
    address: z.string(),
  }),
  shopId: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
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
  createdAt: z.date().default(new Date()),
});

// Request query
export const GetOrdersQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(EnumOrderStatus).optional(),
}).strict();

// Request params
export const GetOrderParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

// Request body
export const CreateOrderBodySchema = z
  .array(
    z.object({
      shopId: z.number(),
      receiver: z.object({
        name: z.string(),
        phoneNumber: z.string().min(10).max(15),
        address: z.string(),
      }),
      cartItemIds: z.array(z.number()).min(1),
    }),
  )
  .min(1);

// Response
export const GetOrdersResponseSchema = z.object({
  data: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
    }).omit({
      receiver: true,
      deletedAt: true,
      createdById: true,
      updatedById: true,
      deletedById: true,
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});

export const GetOrderResponseSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
});

export const CreateOrderResponseSchema = z.object({
  data: z.array(OrderSchema),
});

export const CancelOrderResponseSchema = OrderSchema;
