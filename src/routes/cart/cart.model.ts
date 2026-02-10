import { PaginationQuerySchema } from '@/shared/models/request.model';
import { createPaginationResponseSchema } from '@/shared/models/response.model';
import { CartItemSchema } from '@/shared/models/shared-cart.model';
import { ProductTranslationSchema } from '@/shared/models/shared-product-translation.model';
import { ProductSchema } from '@/shared/models/shared-product.model';
import { SkuSchema } from '@/shared/models/shared-sku.model';
import { UserSchema } from '@/shared/models/shared-user.model';
import z from 'zod';

// NOTE: dùng schema này nếu hàm `findMany2` CÓ response các key:
// createdById, updatedById, deletedById, deletedAt, createdAt, updatedAt
export const CartItemDetailSchema2 = z.object({
  shop: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SkuSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(ProductTranslationSchema),
        }),
      }),
    }),
  ),
});
export type CartItemDetailType2 = z.infer<typeof CartItemDetailSchema2>;

// NOTE: dùng schema này nếu hàm `findMany2` KHÔNG response các key:
// createdById, updatedById, deletedById, deletedAt, createdAt, updatedAt
export const CartItemDetailSchema = z.object({
  shop: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SkuSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(
            ProductTranslationSchema.omit({
              createdById: true,
              updatedById: true,
              deletedById: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            }),
          ),
        }).omit({
          createdById: true,
          updatedById: true,
          deletedById: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
        }),
      }).omit({
        createdById: true,
        updatedById: true,
        deletedById: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      }),
    }),
  ),
});

// Request query
export const GetCartQuerySchema = PaginationQuerySchema.strict();
// For cursor-based pagination
// export const GetCartQuerySchema = z
//   .object({
//     cursor: z.coerce.number().min(0).optional(), // ID của record cuối cùng từ page trước
//     limit: z.coerce.number().int().positive().default(10), // Số lượng records cần lấy
//   })
//   .strict();

// Request body
export const AddToCartBodySchema = CartItemSchema.pick({
  skuId: true,
  quantity: true,
}).strict();

export const UpdateCartBodySchema = AddToCartBodySchema.strict();

export const DeleteCartBodySchema = z
  .object({
    ids: z.array(z.number().int().positive()),
  })
  .strict();

// Response
export const GetCartResponseSchema = createPaginationResponseSchema(CartItemDetailSchema);
// export const GetCartResponseSchema = z.object({
//   data: z.array(CartItemDetailSchema),
//   nextCursor: z.number().nullable(), // ID của record cuối cùng để dùng cho page tiếp theo
//   hasNextPage: z.boolean(), // Còn page tiếp theo không
//   limit: z.number(),
// });
