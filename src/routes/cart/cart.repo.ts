import { Prisma } from '@/generated/prisma/client';
import {
  CartItemNotFoundException,
  InvalidQuantityException,
  OutOfStockSkuException,
  ProductNotFoundException,
  SkuNotFoundException,
} from '@/routes/cart/cart.error';
import {
  AddToCartBodyType,
  CartItemDetailType,
  CartItemType,
  DeleteCartBodyType,
  GetCartQueryType,
  GetCartResponseType,
  UpdateCartBodyType,
} from '@/routes/cart/cart.type';
import { ALL_LANGUAGE_CODE } from '@/shared/constants/common.constant';
import { PrismaService } from '@/shared/services/prisma.service';
import { SkuType } from '@/shared/types/shared-sku.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // For cursor-based pagination
  async findMany(props: { userId: number; languageId: string; query: GetCartQueryType }): Promise<GetCartResponseType> {
    const { userId, languageId, query } = props;
    const { page, limit } = query;

    // 1. Lấy tất cả cart items của user
    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        userId,
        sku: {
          product: {
            deletedAt: null,
            publishedAt: {
              not: null,
              lte: new Date(),
            },
          },
        },
      },
      // WARNING: join nhiều bảng như vậy sẽ làm tăng đáng kể thời gian query
      include: {
        sku: {
          include: {
            product: {
              include: {
                createdBy: true, // shop
                productTranslations: {
                  where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Tính năng: khi update cart item thì sẽ được item đó sẽ được xếp lên vị trí trên cùng
      },
    });

    // 2. Group cart items by shop
    // Cách 1: Sử dụng Map
    const groupMap = new Map<number, CartItemDetailType>();
    for (const cartItem of cartItems) {
      const shopId = cartItem.sku.product.createdById;
      if (!shopId) continue;
      if (!groupMap.has(shopId)) {
        groupMap.set(shopId, { shop: cartItem.sku.product.createdBy, cartItems: [] });
      }
      groupMap.get(shopId)?.cartItems.push(cartItem);
    }
    const cartItemsByShop = Array.from(groupMap.values());

    // Cách 2: Sử dụng reduce
    // const cartItemsByShop2: CartItemDetailType[] = Object.values(
    //   cartItems.reduce(
    //     (result, cartItem) => {
    //       const shopId = cartItem.sku.product.createdById;
    //       if (!shopId) return result;
    //       if (!result[shopId]) {
    //         result[shopId] = { shop: cartItem.sku.product.createdBy, cartItems: [] };
    //       }
    //       result[shopId].cartItems.push(cartItem);
    //       return result;
    //     },
    //     {} as Record<number, CartItemDetailType>,
    //   ),
    // );

    // 3. Pagination
    const skip = (page - 1) * limit;
    const take = limit;
    const totalItems = cartItemsByShop.length;
    const data = cartItemsByShop.slice(skip, skip + take);

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit: limit,
    };
  }

  async findMany2(props: {
    userId: number;
    languageId: string;
    query: GetCartQueryType;
  }): Promise<GetCartResponseType> {
    const { userId, languageId, query } = props;
    const { page, limit } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Đếm tổng số nhóm sản phẩm
    const totalItems$ = this.prismaService.$queryRaw<{ createdById: number }[]>`
      SELECT
        "Product"."createdById"
      FROM "CartItem"
      JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
      JOIN "Product" ON "SKU"."productId" = "Product"."id"
      WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
      GROUP BY "Product"."createdById"
    `;

    const data$ = await this.prismaService.$queryRaw<CartItemDetailType[]>`
      SELECT
        "Product"."createdById",
        json_agg(
          jsonb_build_object(
            'id', "CartItem"."id",
            'quantity', "CartItem"."quantity",
            'skuId', "CartItem"."skuId",
            'userId', "CartItem"."userId",
            'createdAt', "CartItem"."createdAt",
            'updatedAt', "CartItem"."updatedAt",
            'sku', jsonb_build_object(
              'id', "SKU"."id",
              'value', "SKU"."value",
              'price', "SKU"."price",
              'stock', "SKU"."stock",
              'image', "SKU"."image",
              'productId', "SKU"."productId",
              -- 'createdById', "SKU"."createdById",
              -- 'updatedById', "SKU"."updatedById",
              -- 'deletedById', "SKU"."deletedById",
              -- 'createdAt', "SKU"."createdAt",
              -- 'updatedAt', "SKU"."updatedAt",
              -- 'deletedAt', "SKU"."deletedAt",
              'product', jsonb_build_object(
                'id', "Product"."id",
                'name', "Product"."name",
                'basePrice', "Product"."basePrice",
                'virtualPrice', "Product"."virtualPrice",
                'brandId', "Product"."brandId",
                'images', "Product"."images",
                'publishedAt', "Product"."publishedAt",
                'variants', "Product"."variants",
                -- 'createdById', "Product"."createdById",
                -- 'updatedById', "Product"."updatedById",
                -- 'deletedById', "Product"."deletedById",
                -- 'createdAt', "Product"."createdAt",
                -- 'updatedAt', "Product"."updatedAt",
                -- 'deletedAt', "Product"."deletedAt",
                'productTranslations', COALESCE((
                  SELECT json_agg(
                    jsonb_build_object(
                      'id', pt."id",
                      'productId', pt."productId",
                      'languageId', pt."languageId",
                      'name', pt."name",
                      'description', pt."description"
                      -- 'createdById', pt."createdById",
                      -- 'updatedById', pt."updatedById",
                      -- 'deletedById', pt."deletedById",
                      -- 'createdAt', pt."createdAt",
                      -- 'updatedAt', pt."updatedAt",
                      -- 'deletedAt', pt."deletedAt"
                    )
                  ) FILTER (WHERE pt."id" IS NOT NULL)
                  FROM "ProductTranslation" pt
                  WHERE pt."productId" = "Product"."id"
                    AND pt."deletedAt" IS NULL
                    ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND pt."languageId" = ${languageId}`}
                ), '[]'::json)
              )
            )
          ) ORDER BY "CartItem"."updatedAt" DESC
        ) AS "cartItems",
        jsonb_build_object(
          'id', "User"."id",
          'name', "User"."name",
          'avatar', "User"."avatar"
        ) AS "shop"
      FROM "CartItem"
      JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
      JOIN "Product" ON "SKU"."productId" = "Product"."id"
      LEFT JOIN "ProductTranslation" ON "Product"."id" = "ProductTranslation"."productId"
        AND "ProductTranslation"."deletedAt" IS NULL
        ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND "ProductTranslation"."languageId" = ${languageId}`}
      LEFT JOIN "User" ON "Product"."createdById" = "User"."id"
      WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
      GROUP BY "Product"."createdById", "User"."id"
      ORDER BY MAX("CartItem"."updatedAt") DESC
      LIMIT ${take}
      OFFSET ${skip}
    `;

    const [data, totalItems] = await Promise.all([data$, totalItems$]);

    return {
      data,
      totalItems: totalItems.length,
      totalPages: Math.ceil(totalItems.length / limit),
      currentPage: page,
      limit,
    };
  }

  async create(props: { userId: number; body: AddToCartBodyType }): Promise<CartItemType> {
    const { userId, body } = props;
    const { skuId, quantity } = body;

    // 1. Validate sku
    await this._validateSku({ userId, skuId, quantity, isCreate: true });

    // 2. Upsert cart item
    // Mục đích: nếu cart item đã tồn tại thì tăng quantity lên, nếu không thì tạo mới
    // Vì vậy trong bảng CartItem sẽ có unique constraint trên cặp (userId, skuId)
    const cartItem = await this.prismaService.cartItem.upsert({
      where: {
        userId_skuId: {
          userId,
          skuId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        skuId,
        quantity,
      },
    });

    return cartItem;
  }

  async update(props: { userId: number; id: number; body: UpdateCartBodyType }): Promise<CartItemType> {
    const { userId, id, body } = props;
    const { skuId, quantity } = body;

    // 1. Validate sku
    await this._validateSku({ userId, skuId, quantity, isCreate: false });

    // 2. Update cart item
    const cartItem = await this.prismaService.cartItem.update({
      where: {
        id,
        userId,
      },
      data: { skuId, quantity },
    });

    return cartItem;
  }

  async delete(props: { userId: number; body: DeleteCartBodyType }): Promise<{ count: number }> {
    const { userId, body } = props;

    const result = await this.prismaService.cartItem.deleteMany({
      where: { id: { in: body.ids }, userId },
    });

    return result;
  }

  private async _validateSku({
    userId,
    skuId,
    quantity,
    isCreate,
  }: {
    userId: number;
    skuId: number;
    quantity: number;
    isCreate: boolean;
  }): Promise<SkuType> {
    // 1. lấy danh sách sku theo skuId
    const [sku, cartItem] = await Promise.all([
      this.prismaService.sKU.findUnique({
        where: {
          id: skuId,
          deletedAt: null,
        },
        include: {
          product: true,
        },
      }),
      isCreate
        ? this.prismaService.cartItem.findUnique({
            where: {
              userId_skuId: {
                userId,
                skuId,
              },
            },
          })
        : Promise.resolve(null),
    ]);

    if (!sku) {
      throw SkuNotFoundException;
    }

    // 2. Trong trường hợp add to cart (isCreate = true):
    // Kiểm tra số lượng cần thêm vào cart có lớn hơn số lượng trong kho không.
    // Trường hợp update cart item: không cần kiểm tra vì số lượng quantity khi update là replace (quantity mới) chứ không phải cộng thêm.
    if (isCreate && cartItem && cartItem.quantity + quantity > sku.stock) {
      throw InvalidQuantityException;
    }

    // 3. Kiểm tra sku có hết hàng không hoặc số lượng cần thêm vào cart lớn hơn số lượng trong kho
    if (sku.stock <= 0 || sku.stock < quantity) {
      throw OutOfStockSkuException;
    }

    // 4. Kiểm tra product có tồn tại không hoặc có isPublished không
    const product = sku.product;
    if (
      product.deletedAt !== null || // product đã bị xoá mềm
      product.publishedAt === null || // product chưa được publish
      (product.publishedAt !== null && product.publishedAt > new Date()) // product đã được publish nhưng chưa đến thời gian publish
    ) {
      throw ProductNotFoundException;
    }

    // 5. Return sku
    return sku;
  }
}
