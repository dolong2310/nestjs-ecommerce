import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { PaginationQuerySchema } from '@/shared/models/request.model';
import { OrderSchema, ProductSKUSnapshotSchema } from '@/shared/models/shared-order.model';
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
