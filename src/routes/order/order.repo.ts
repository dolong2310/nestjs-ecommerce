import {
  CannotCancelOrderException,
  CartItemDuplicatedException,
  CartItemNotFoundException,
  OrderNotFoundException,
  ProductNotFoundException,
  SkuNotBelongToShopException,
  SkuOutOfStockException,
} from '@/routes/order/order.error';
import { OrderProducer } from '@/routes/order/order.producer';
import {
  CancelOrderResponseType,
  CreateOrderBodyType,
  CreateOrderResponseType,
  GetOrderResponseType,
  GetOrdersQueryType,
  GetOrdersResponseType,
} from '@/routes/order/order.type';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus } from '@/shared/constants/payment.constant';
import { VersionConflictException } from '@/shared/errors/shared-error.error';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { OrderType } from '@/shared/types/shared-order.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}

  async findMany(props: { userId: number; query: GetOrdersQueryType }): Promise<GetOrdersResponseType> {
    const { userId, query } = props;
    const { page, limit, status } = query;

    const [orders, totalOrders] = await Promise.all([
      this.prismaService.order.findMany({
        where: {
          userId,
          status,
          deletedAt: null,
        },
        include: {
          items: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.order.count({
        where: {
          status,
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: orders,
      totalItems: totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      limit: limit,
    };
  }

  async create(props: { userId: number; body: CreateOrderBodyType }): Promise<CreateOrderResponseType> {
    const { userId, body: bodyOrderItems } = props;

    const orders = await this.prismaService.$transaction(async (tx) => {
      // 1. Validate body
      const allBodyCartItemIds: number[] = bodyOrderItems.flatMap((item) => item.cartItemIds);

      // 2. Check duplicates
      const uniqueIds = new Set(allBodyCartItemIds);
      if (uniqueIds.size !== allBodyCartItemIds.length) {
        throw CartItemDuplicatedException;
      }

      // 3. Kiểm tra xem tất cả cartItemIds có tồn tại trong database không.
      // const cartItemsSkuIds = await tx.cartItem.findMany({
      //   where: {
      //     userId,
      //     id: {
      //       in: allBodyCartItemIds,
      //     },
      //   },
      //   select: {
      //     skuId: true,
      //   },
      // });

      // 4. Lock "skus" in database (avoid race condition)
      // const foundSkuIds = cartItemsSkuIds.map((item) => item.skuId);
      // await tx.$queryRaw`SELECT * FROM "SKU" WHERE id IN (${Prisma.join(foundSkuIds)}) FOR UPDATE`;

      // 5. Get cart items
      const cartItems = await tx.cartItem.findMany({
        where: {
          userId,
          id: {
            in: allBodyCartItemIds,
          },
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: true,
                },
              },
            },
          },
        },
      });

      // 6. Kiểm tra cartItemIds truyền lên có khớp với cartItems trong database không.
      if (cartItems.length !== allBodyCartItemIds.length) {
        throw CartItemNotFoundException; // Some cart items do not exist
      }

      // 7. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho không.
      const isOutOfStock = cartItems.some((cartItem) => {
        // cartItem.quantity luôn dương vì đã validate ở DTO
        return cartItem.sku.stock < cartItem.quantity;
      });

      if (isOutOfStock) {
        throw SkuOutOfStockException; // Some skus are out of stock
      }

      // 8. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xoá hay ẩn không.
      const isDeletedOrDraftOrNotPublished = cartItems.some((cartItem) => {
        const isDeleted = cartItem.sku.product.deletedAt !== null;
        const isDraft = cartItem.sku.product.publishedAt === null;
        const isNotPublished =
          cartItem.sku.product.publishedAt !== null && cartItem.sku.product.publishedAt > new Date();
        return isDeleted || isDraft || isNotPublished;
      });

      if (isDeletedOrDraftOrNotPublished) {
        throw ProductNotFoundException; // Some products are deleted or unpublished
      }

      // 9. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopId gửi lên không.
      // Cách 1:
      const cartItemMap = new Map<number, (typeof cartItems)[number]>(cartItems.map((item) => [item.id, item]));
      let isSkuNotBelongToShop = false;
      outerLoop: for (const orderItem of bodyOrderItems) {
        const shopId = orderItem.shopId;
        for (const cartItemId of orderItem.cartItemIds) {
          const cartItem = cartItemMap.get(cartItemId)!;
          const isSkuBelongToShop = cartItem.sku.createdById === shopId;
          if (!isSkuBelongToShop) {
            isSkuNotBelongToShop = true;
            break outerLoop;
          }
        }
      }

      // Cách 2:
      // const cartItemMap = new Map(cartItems.map((item) => [item.id, item]));

      // const isSkuNotBelongToShop = bodyOrderItems.some((orderItem) =>
      //   orderItem.cartItemIds.some((cartItemId) => {
      //     const cartItem = cartItemMap.get(cartItemId)!;
      //     return cartItem.sku.createdById !== orderItem.shopId;
      //   }),
      // );

      if (isSkuNotBelongToShop) {
        throw SkuNotBelongToShopException; // Some skus are not belong to the same shop
      }

      // 10. Tạo order và Xoá cartItem
      // 10.1. Kiểm tra stock của sku
      const skuIds = cartItems.map((item) => item.skuId);
      const currentSkus = await tx.sKU.findMany({
        where: {
          id: {
            in: skuIds,
          },
        },
        select: {
          id: true,
          stock: true,
        },
      });

      const skuStockMap = new Map(currentSkus.map((s) => [s.id, s.stock]));

      for (const cartItem of cartItems) {
        const currentStock = skuStockMap.get(cartItem.sku.id)!;
        if (currentStock < cartItem.quantity) {
          throw SkuOutOfStockException;
        }
      }

      // 10.2 Tạo Payment với status PENDING
      const payment = await tx.payment.create({
        data: {
          status: EnumPaymentStatus.PENDING,
        },
      });

      // 10.3. Tạo order
      // NOTE: tại sao không dùng tx.order.createMany?
      // Vì createMany không hỗ trợ tạo relationship với các model khác.
      // Model cần tạo cùng với order là items (ProductSKUSnapshot[]) và products.
      const createdOrders: OrderType[] = [];
      for (const orderItem of bodyOrderItems) {
        const createdOrder = await tx.order.create({
          data: {
            userId,
            paymentId: payment.id,
            status: EnumOrderStatus.PENDING_PAYMENT,
            receiver: orderItem.receiver,
            createdById: userId,
            // items => ProductSKUSnapshot[]
            items: {
              create: orderItem.cartItemIds.map((cartItemId) => {
                const cartItem = cartItemMap.get(cartItemId)!;
                return {
                  productId: cartItem.sku.product.id,
                  productName: cartItem.sku.product.name,
                  productTranslations: cartItem.sku.product.productTranslations.map((t) => {
                    return {
                      id: t.id,
                      name: t.name,
                      languageId: t.languageId,
                      description: t.description,
                    };
                  }),
                  quantity: cartItem.quantity,
                  image: cartItem.sku.image,
                  skuId: cartItem.sku.id,
                  skuPrice: cartItem.sku.price,
                  skuValue: cartItem.sku.value,
                };
              }),
            },
            products: {
              connect: orderItem.cartItemIds.map((cartItemId) => {
                const cartItem = cartItemMap.get(cartItemId)!;
                return {
                  id: cartItem.sku.product.id,
                };
              }),
            },
          },
        });
        createdOrders.push(createdOrder);
      }

      // 10.4. Xoá cartItem
      await tx.cartItem.deleteMany({
        where: {
          id: {
            in: allBodyCartItemIds,
          },
        },
      });

      // 10.5. Cập nhật stock của sku
      for (const cartItem of cartItems) {
        await tx.sKU
          .update({
            where: {
              id: cartItem.sku.id,
              // Optimistic Lock (thay vì lock sku trên database thì dùng updatedAt để kiểm tra xem sku có bị cập nhật trong khi đang cập nhật stock không)
              // Ngoài ra thêm stock gte: cartItem.quantity để cho chặt chẽ hơn, nếu stock không đủ thì sẽ bị lỗi VersionConflictException
              updatedAt: cartItem.sku.updatedAt, // Đảm bảo không có ai cập nhật SKU trong khi đang cập nhật stock
              stock: {
                gte: cartItem.quantity, // Đảm bảo số lượng tồn kho đủ để trừ
              },
            },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          })
          .catch((error) => {
            if (isNotFoundPrismaError(error)) {
              throw VersionConflictException;
            }
            throw error;
          });
      }

      // const [createdOrders] = await Promise.all([createdOrdersPromise, deletedCartItemsPromise, updatedSkusPromise]);

      // 10.6. Thêm job cancel payment vào queue
      // WARNING: Chạy promise này sau khi các tx đã commit/rollback, tránh trường hợp tx failed -> rollback -> job cancel payment vẫn được thực thi (tăng stock) -> bug
      await this.orderProducer.addJobCancelPayment(payment.id);

      // 10.7. Trả về order vừa tạo
      return createdOrders;
    });

    return { data: orders };
  }

  async findById(props: { userId: number; id: number }): Promise<GetOrderResponseType | null> {
    const { userId, id: orderId } = props;
    const order = await this.prismaService.order.findUnique({
      where: {
        userId,
        id: orderId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });
    return order;
  }

  async cancel(props: { userId: number; id: number }): Promise<CancelOrderResponseType> {
    const { userId, id: orderId } = props;
    // Tạo transaction để update Payment Status, Order Status và cập nhật stock của sku
    const updatedOrder = await this.prismaService.$transaction(async (tx) => {
      // Chỉ được cancel order nếu status là PENDING_PAYMENT.
      const order = await this.findById({ userId, id: orderId });

      if (!order) {
        throw OrderNotFoundException;
      }
      // 1. kiểm tra status của order có phải là PENDING_PAYMENT không.
      // const order = await this.prismaService.order.findUniqueOrThrow({
      //   where: {
      //     userId,
      //     id: orderId,
      //     deletedAt: null,
      //   },
      // });

      if (order.status !== EnumOrderStatus.PENDING_PAYMENT) {
        throw CannotCancelOrderException;
      }

      // 2. update status của order thành CANCELLED
      const updatedOrderPromise = this.prismaService.order.update({
        where: {
          userId,
          id: orderId,
          deletedAt: null,
        },
        data: {
          status: EnumOrderStatus.CANCELLED,
          updatedById: userId,
        },
      });

      // 3. update status của payment thành CANCELLED
      const updatedPaymentPromise = tx.payment.update({
        where: {
          id: order.paymentId,
        },
        data: {
          status: EnumPaymentStatus.FAILED,
        },
      });

      // 4. update Stock items sku của order
      const updatedStockItemsSkuPromises = Promise.all(
        order.items
          .filter((sku) => Boolean(sku.skuId))
          .map((sku) => {
            return tx.sKU.update({
              where: { id: sku.skuId as number, deletedAt: null },
              data: {
                stock: {
                  increment: sku.quantity, // khôi phục stock của sku khi order bị cancelled
                },
              },
            });
          }),
      );

      const [updatedOrder] = await Promise.all([
        updatedOrderPromise,
        updatedPaymentPromise,
        updatedStockItemsSkuPromises,
      ]);

      return updatedOrder;
    });

    return updatedOrder;
  }
}
