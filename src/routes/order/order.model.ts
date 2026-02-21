import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { PaginationQuerySchema } from '@/shared/models/request.model';
import { OrderSchema, ProductSKUSnapshotSchema } from '@/shared/models/shared-order.model';
import { EnumPaymentMethod } from '@/shared/payment-providers/core/constants';
import z from 'zod';

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
export const CreateOrderBodySchema = z.object({
  paymentMethod: z.enum(EnumPaymentMethod).nullable().optional(),
  orders: z
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
    .min(1),
});

// Response
export const GetOrdersResponseSchema = z.object({
  data: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
    }).omit({
      receiver: true,
      userId: true,
      createdById: true,
      updatedById: true,
      deletedById: true,
      deletedAt: true,
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});

export const GetOrderResponseSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
}).omit({
  userId: true,
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
});

export const CreateOrderResponseSchema = z.object({
  data: z.array(
    OrderSchema.omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      deletedAt: true,
    }),
  ),
  paymentUrl: z.string().nullable(),
});

export const CancelOrderResponseSchema = OrderSchema.omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
});
