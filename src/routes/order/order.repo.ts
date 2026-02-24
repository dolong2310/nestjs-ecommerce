import { Prisma } from '@/generated/prisma/client';
import {
  CreateOrderBodyType,
  GetOrderResponseType,
  GetOrdersQueryType,
  GetOrdersResponseType,
} from '@/routes/order/order.type';
import { EnumCouponStatus } from '@/shared/constants/coupon.constant';
import { EnumOrderStatus, OrderStatusType } from '@/shared/constants/order.constant';
import { EnumPaymentStatus, PaymentStatusType } from '@/shared/constants/payment.constant';
import { paginate } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { CartItemIncludeSkuAndProductType } from '@/shared/types/shared-cart.type';
import { GetCouponResponseType } from '@/shared/types/shared-coupon.type';
import { OrderType } from '@/shared/types/shared-order.type';
import { PaymentType } from '@/shared/types/shared-payment.type';
import { SkuType } from '@/shared/types/shared-sku.type';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaService>>,
  ) {}

  async findMany(props: { userId: number; query: GetOrdersQueryType }): Promise<GetOrdersResponseType> {
    const { userId, query } = props;
    const { page, limit, status } = query;

    const ordersPromise = this.prismaService.order.findMany({
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
    });
    const totalOrdersPromise = this.prismaService.order.count({
      where: {
        userId,
        status,
        deletedAt: null,
      },
    });

    return await paginate(ordersPromise, totalOrdersPromise, page, limit);
  }

  findCartItemsSkuIds({
    userId,
    cartItemIds,
  }: {
    userId: number;
    cartItemIds: number[];
  }): Promise<{ skuId: number }[]> {
    return this.prismaService.cartItem.findMany({
      where: {
        userId,
        id: {
          in: cartItemIds,
        },
      },
      select: {
        skuId: true,
      },
    });
  }

  findCartItems({
    userId,
    cartItemIds,
  }: {
    userId: number;
    cartItemIds: number[];
  }): Promise<CartItemIncludeSkuAndProductType[]> {
    return this.txHost.tx.cartItem.findMany({
      where: {
        userId,
        id: {
          in: cartItemIds,
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
  }

  findSkus(skuIds: number[]): Promise<{ id: number; stock: number }[]> {
    return this.txHost.tx.sKU.findMany({
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
  }

  createPayment(status: PaymentStatusType): Promise<PaymentType> {
    return this.txHost.tx.payment.create({
      data: {
        status: status,
      },
    });
  }

  createOrder({
    userId,
    paymentId,
    status = EnumOrderStatus.PENDING_PAYMENT,
    orderItem,
    cartItemMap,
    couponId,
    discountAmount,
  }: {
    userId: number;
    paymentId: number;
    status: OrderStatusType;
    orderItem: CreateOrderBodyType['orders'][number];
    cartItemMap: Map<number, CartItemIncludeSkuAndProductType>;
    couponId?: number | null;
    discountAmount?: number;
  }): Promise<OrderType> {
    return this.txHost.tx.order.create({
      data: {
        userId,
        shopId: orderItem.shopId,
        paymentId,
        status,
        receiver: orderItem.receiver,
        createdById: userId,
        couponId: couponId ?? null,
        discountAmount: discountAmount ?? 0,
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
  }

  deleteCartItems(cartItemIds: number[]) {
    return this.txHost.tx.cartItem.deleteMany({
      where: {
        id: {
          in: cartItemIds,
        },
      },
    });
  }

  // Lấy coupon hợp lệ để áp dụng cho order (chạy trong transaction)
  findCouponForOrder(couponId: number): Promise<GetCouponResponseType | null> {
    return this.txHost.tx.coupon.findUnique({
      where: {
        id: couponId,
        deletedAt: null,
        status: EnumCouponStatus.ACTIVE,
        startDate: { lte: new Date() },
        endDate: { gt: new Date() },
        quantity: { gt: 0 },
      },
    });
  }

  // Trừ quantity coupon theo kiểu atomic (WHERE quantity > 0 để tránh race condition)
  decrementCouponQuantity(couponId: number): Promise<GetCouponResponseType> {
    return this.txHost.tx.coupon.update({
      where: {
        id: couponId,
        quantity: { gt: 0 },
      },
      data: {
        quantity: { decrement: 1 },
      },
    });
  }

  // Hoàn lại quantity coupon khi cancel order
  incrementCouponQuantity(couponId: number): Promise<GetCouponResponseType> {
    return this.txHost.tx.coupon.update({
      where: { id: couponId },
      data: { quantity: { increment: 1 } },
    });
  }

  updateSkusStock({
    skuId,
    quantity,
    updatedAt,
    isCreateOrder,
  }: {
    skuId: number;
    quantity: number;
    updatedAt?: Date;
    isCreateOrder: boolean;
  }): Promise<SkuType> {
    const where: Prisma.SKUWhereUniqueInput = {
      id: skuId,
    };

    const data: Prisma.XOR<Prisma.SKUUpdateInput, Prisma.SKUUncheckedUpdateInput> = {};

    if (isCreateOrder) {
      // Optimistic Lock (thay vì lock sku trên database thì dùng updatedAt để kiểm tra xem sku có bị cập nhật trong khi đang cập nhật stock không)
      // Ngoài ra thêm stock gte: cartItem.quantity để cho chặt chẽ hơn, nếu stock không đủ thì sẽ bị lỗi VersionConflictException.
      // NOTE: có thể comment updatedAt và stock vì đã sử dụng redlock hoặc có mở comment để kết hợp cả 2 cách lock (optimistic lock và redlock)
      // Trường hợp kết hợp cả 2 loại lock: khi transaction excute quá thời gian của redlock (hạn chế lock.extend(LOCK_TIME_OUT)) thì sẽ có optimistic lock cover.
      where.updatedAt = updatedAt; // Đảm bảo không có ai cập nhật SKU trong khi đang cập nhật stock
      where.stock = {
        gte: quantity, // Đảm bảo số lượng tồn kho đủ để trừ
      };
      data.stock = {
        decrement: quantity,
      };
    } else {
      // Cancel Order
      where.deletedAt = null;
      data.stock = {
        increment: quantity, // khôi phục stock của sku khi order bị cancelled
      };
    }

    return this.txHost.tx.sKU.update({
      where,
      data,
    });
  }

  // các methods cho delete order transaction
  findById(props: { userId: number; id: number }): Promise<GetOrderResponseType | null> {
    const { userId, id: orderId } = props;
    return this.txHost.tx.order.findUnique({
      where: {
        userId,
        id: orderId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });
  }

  updateOrderById({
    userId,
    orderId,
    status = EnumOrderStatus.CANCELLED,
  }: {
    userId: number;
    orderId: number;
    status: OrderStatusType;
  }): Promise<OrderType> {
    return this.txHost.tx.order.update({
      where: {
        userId,
        id: orderId,
        deletedAt: null,
      },
      data: {
        status: status,
        updatedById: userId,
      },
    });
  }

  updatePaymentById({
    paymentId,
    status = EnumPaymentStatus.FAILED,
  }: {
    paymentId: number;
    status: PaymentStatusType;
  }): Promise<PaymentType> {
    return this.txHost.tx.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: status,
      },
    });
  }

  // async create(props: { userId: number; body: CreateOrderBodyType['orders'] }): Promise<CreateOrderResponseType> {
  //   const { userId, body: bodyOrderItems } = props;

  //   // 1. Validate body
  //   const allBodyCartItemIds: number[] = bodyOrderItems.flatMap((item) => item.cartItemIds);

  //   // 2. Redis redlock: Lock tất cả sku cần mua để tránh race condition khi tạo order
  //   const cartItemsSkuIds = await this.prismaService.cartItem.findMany({
  //     where: {
  //       userId,
  //       id: {
  //         in: allBodyCartItemIds,
  //       },
  //     },
  //     select: {
  //       skuId: true,
  //     },
  //   });

  //   const foundSkuIds = cartItemsSkuIds.map((item) => item.skuId);

  //   // Acquire locks for all skus
  //   const locks = await Promise.all(
  //     foundSkuIds.map((skuId) =>
  //       redlock.acquire(
  //         [`lock:sku:${skuId}`],
  //         3000, // 3000ms => giữ lock trong 3s
  //       ),
  //     ),
  //   ).catch(() => {
  //     throw ServerOverloadedException;
  //   });

  //   try {
  //     const orders = await this.prismaService.$transaction(async (tx) => {
  //       // 3. Check duplicates
  //       const uniqueIds = new Set(allBodyCartItemIds);
  //       if (uniqueIds.size !== allBodyCartItemIds.length) {
  //         throw CartItemDuplicatedException;
  //       }

  //       // 4. (Pessimistic Lock) Kiểm tra xem tất cả cartItemIds có tồn tại trong database không.
  //       // const cartItemsSkuIds = await tx.cartItem.findMany({
  //       //   where: {
  //       //     userId,
  //       //     id: {
  //       //       in: allBodyCartItemIds,
  //       //     },
  //       //   },
  //       //   select: {
  //       //     skuId: true,
  //       //   },
  //       // });

  //       // 5. Lock "skus" in database (avoid race condition)
  //       // const foundSkuIds = cartItemsSkuIds.map((item) => item.skuId);
  //       // await tx.$queryRaw`SELECT * FROM "SKU" WHERE id IN (${Prisma.join(foundSkuIds)}) FOR UPDATE`;

  //       // 6. Get cart items
  //       const cartItems = await tx.cartItem.findMany({
  //         where: {
  //           userId,
  //           id: {
  //             in: allBodyCartItemIds,
  //           },
  //         },
  //         include: {
  //           sku: {
  //             include: {
  //               product: {
  //                 include: {
  //                   productTranslations: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });

  //       // 7. Kiểm tra cartItemIds truyền lên có khớp với cartItems trong database không.
  //       if (cartItems.length !== allBodyCartItemIds.length) {
  //         throw CartItemNotFoundException; // Some cart items do not exist
  //       }

  //       // 8. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho không.
  //       const isOutOfStock = cartItems.some((cartItem) => {
  //         // cartItem.quantity luôn dương vì đã validate ở DTO
  //         return cartItem.sku.stock < cartItem.quantity;
  //       });

  //       if (isOutOfStock) {
  //         throw SkuOutOfStockException; // Some skus are out of stock
  //       }

  //       // 9. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xoá hay ẩn không.
  //       const isDeletedOrDraftOrNotPublished = cartItems.some((cartItem) => {
  //         const isDeleted = cartItem.sku.product.deletedAt !== null;
  //         const isDraft = cartItem.sku.product.publishedAt === null;
  //         const isNotPublished =
  //           cartItem.sku.product.publishedAt !== null && cartItem.sku.product.publishedAt > new Date();
  //         return isDeleted || isDraft || isNotPublished;
  //       });

  //       if (isDeletedOrDraftOrNotPublished) {
  //         throw ProductNotFoundException; // Some products are deleted or unpublished
  //       }

  //       // 10. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopId gửi lên không.
  //       // Cách 1:
  //       const cartItemMap = new Map<number, (typeof cartItems)[number]>(cartItems.map((item) => [item.id, item]));
  //       let isSkuNotBelongToShop = false;
  //       outerLoop: for (const orderItem of bodyOrderItems) {
  //         const shopId = orderItem.shopId;
  //         for (const cartItemId of orderItem.cartItemIds) {
  //           const cartItem = cartItemMap.get(cartItemId)!;
  //           const isSkuBelongToShop = cartItem.sku.createdById === shopId;
  //           if (!isSkuBelongToShop) {
  //             isSkuNotBelongToShop = true;
  //             break outerLoop;
  //           }
  //         }
  //       }

  //       // Cách 2:
  //       // const cartItemMap = new Map(cartItems.map((item) => [item.id, item]));

  //       // const isSkuNotBelongToShop = bodyOrderItems.some((orderItem) =>
  //       //   orderItem.cartItemIds.some((cartItemId) => {
  //       //     const cartItem = cartItemMap.get(cartItemId)!;
  //       //     return cartItem.sku.createdById !== orderItem.shopId;
  //       //   }),
  //       // );

  //       if (isSkuNotBelongToShop) {
  //         throw SkuNotBelongToShopException; // Some skus are not belong to the same shop
  //       }

  //       // 11. Tạo order và Xoá cartItem
  //       // 11.1. Kiểm tra stock của sku
  //       const skuIds = cartItems.map((item) => item.skuId);
  //       const currentSkus = await tx.sKU.findMany({
  //         where: {
  //           id: {
  //             in: skuIds,
  //           },
  //         },
  //         select: {
  //           id: true,
  //           stock: true,
  //         },
  //       });

  //       const skuStockMap = new Map(currentSkus.map((s) => [s.id, s.stock]));

  //       for (const cartItem of cartItems) {
  //         const currentStock = skuStockMap.get(cartItem.sku.id)!;
  //         if (currentStock < cartItem.quantity) {
  //           throw SkuOutOfStockException;
  //         }
  //       }

  //       // 11.2 Tạo Payment với status PENDING
  //       const payment = await tx.payment.create({
  //         data: {
  //           status: EnumPaymentStatus.PENDING,
  //         },
  //       });

  //       // 11.3. Tạo order
  //       // NOTE: tại sao không dùng tx.order.createMany?
  //       // Vì createMany không hỗ trợ tạo relationship với các model khác.
  //       // Model cần tạo cùng với order là items (ProductSKUSnapshot[]) và products.
  //       const createdOrders: OrderType[] = [];
  //       for (const orderItem of bodyOrderItems) {
  //         const createdOrder = await tx.order.create({
  //           data: {
  //             userId,
  //             paymentId: payment.id,
  //             status: EnumOrderStatus.PENDING_PAYMENT,
  //             receiver: orderItem.receiver,
  //             createdById: userId,
  //             // items => ProductSKUSnapshot[]
  //             items: {
  //               create: orderItem.cartItemIds.map((cartItemId) => {
  //                 const cartItem = cartItemMap.get(cartItemId)!;
  //                 return {
  //                   productId: cartItem.sku.product.id,
  //                   productName: cartItem.sku.product.name,
  //                   productTranslations: cartItem.sku.product.productTranslations.map((t) => {
  //                     return {
  //                       id: t.id,
  //                       name: t.name,
  //                       languageId: t.languageId,
  //                       description: t.description,
  //                     };
  //                   }),
  //                   quantity: cartItem.quantity,
  //                   image: cartItem.sku.image,
  //                   skuId: cartItem.sku.id,
  //                   skuPrice: cartItem.sku.price,
  //                   skuValue: cartItem.sku.value,
  //                 };
  //               }),
  //             },
  //             products: {
  //               connect: orderItem.cartItemIds.map((cartItemId) => {
  //                 const cartItem = cartItemMap.get(cartItemId)!;
  //                 return {
  //                   id: cartItem.sku.product.id,
  //                 };
  //               }),
  //             },
  //           },
  //         });
  //         createdOrders.push(createdOrder);
  //       }

  //       // 11.4. Xoá cartItem
  //       await tx.cartItem.deleteMany({
  //         where: {
  //           id: {
  //             in: allBodyCartItemIds,
  //           },
  //         },
  //       });

  //       // 11.5. Cập nhật stock của sku
  //       for (const cartItem of cartItems) {
  //         await tx.sKU
  //           .update({
  //             where: {
  //               id: cartItem.sku.id,
  //               // Optimistic Lock (thay vì lock sku trên database thì dùng updatedAt để kiểm tra xem sku có bị cập nhật trong khi đang cập nhật stock không)
  //               // Ngoài ra thêm stock gte: cartItem.quantity để cho chặt chẽ hơn, nếu stock không đủ thì sẽ bị lỗi VersionConflictException.
  //               // NOTE: có thể comment updatedAt và stock vì đã sử dụng redlock hoặc có mở comment để kết hợp cả 2 cách lock (optimistic lock và redlock)
  //               // Trường hợp kết hợp cả 2 loại lock: khi transaction excute quá thời gian của redlock (hạn chế lock.extend(LOCK_TIME_OUT)) thì sẽ có optimistic lock cover.
  //               updatedAt: cartItem.sku.updatedAt, // Đảm bảo không có ai cập nhật SKU trong khi đang cập nhật stock
  //               stock: {
  //                 gte: cartItem.quantity, // Đảm bảo số lượng tồn kho đủ để trừ
  //               },
  //             },
  //             data: {
  //               stock: {
  //                 decrement: cartItem.quantity,
  //               },
  //             },
  //           })
  //           .catch((error) => {
  //             if (isNotFoundPrismaError(error)) {
  //               throw VersionConflictException;
  //             }
  //             throw error;
  //           });
  //       }

  //       // const [createdOrders] = await Promise.all([createdOrdersPromise, deletedCartItemsPromise, updatedSkusPromise]);

  //       // 11.6. Thêm job cancel payment vào queue
  //       // WARNING: Chạy promise này sau khi các tx, tránh trường hợp tx failed -> rollback -> job cancel payment vẫn được thực thi (tăng stock) -> bug
  //       await this.orderProducer.addJobCancelPayment(payment.id);

  //       // 11.7. Trả về order vừa tạo
  //       return createdOrders;
  //     });

  //     return { data: orders };
  //   } finally {
  //     // 12. Giải phóng tất cả locks
  //     await Promise.all(locks.map((lock) => lock.release())).catch(() => {});
  //   }
  // }

  // async cancel(props: { userId: number; id: number }): Promise<CancelOrderResponseType> {
  //   const { userId, id: orderId } = props;
  //   // Tạo transaction để update Payment Status, Order Status và cập nhật stock của sku
  //   const updatedOrder = await this.prismaService.$transaction(async (tx) => {
  //     // Chỉ được cancel order nếu status là PENDING_PAYMENT.
  //     const order = await this.findById({ userId, id: orderId });

  //     if (!order) {
  //       throw OrderNotFoundException;
  //     }
  //     // 1. kiểm tra status của order có phải là PENDING_PAYMENT không.
  //     // const order = await this.prismaService.order.findUniqueOrThrow({
  //     //   where: {
  //     //     userId,
  //     //     id: orderId,
  //     //     deletedAt: null,
  //     //   },
  //     // });

  //     if (order.status !== EnumOrderStatus.PENDING_PAYMENT) {
  //       throw CannotCancelOrderException;
  //     }

  //     // 2. update status của order thành CANCELLED
  //     const updatedOrderPromise = this.prismaService.order.update({
  //       where: {
  //         userId,
  //         id: orderId,
  //         deletedAt: null,
  //       },
  //       data: {
  //         status: EnumOrderStatus.CANCELLED,
  //         updatedById: userId,
  //       },
  //     });

  //     // 3. update status của payment thành CANCELLED
  //     const updatedPaymentPromise = tx.payment.update({
  //       where: {
  //         id: order.paymentId,
  //       },
  //       data: {
  //         status: EnumPaymentStatus.FAILED,
  //       },
  //     });

  //     // 4. update Stock items sku của order
  //     const updatedStockItemsSkuPromises = Promise.all(
  //       order.items
  //         .filter((sku) => Boolean(sku.skuId))
  //         .map((sku) => {
  //           return tx.sKU.update({
  //             where: { id: sku.skuId as number, deletedAt: null },
  //             data: {
  //               stock: {
  //                 increment: sku.quantity, // khôi phục stock của sku khi order bị cancelled
  //               },
  //             },
  //           });
  //         }),
  //     );

  //     const [updatedOrder] = await Promise.all([
  //       updatedOrderPromise,
  //       updatedPaymentPromise,
  //       updatedStockItemsSkuPromises,
  //     ]);

  //     return updatedOrder;
  //   });

  //   return updatedOrder;
  // }
}
