import { redlock } from '@/redis';
import {
  CannotCancelOrderException,
  CartItemDuplicatedException,
  OrderNotFoundException,
  SkuNotBelongToShopException,
  SkuOutOfStockException,
} from '@/routes/order/order.error';
import { OrderProducer } from '@/routes/order/order.producer';
import { OrderRepository } from '@/routes/order/order.repo';
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
import {
  CartItemNotFoundException,
  ProductNotFoundException,
  ServerOverloadedException,
} from '@/shared/errors/shared-error.error';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { OrderType } from '@/shared/types/shared-order.type';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderProducer: OrderProducer,
  ) {}

  getOrders(props: { userId: number; query: GetOrdersQueryType }): Promise<GetOrdersResponseType> {
    return this.orderRepository.findMany(props);
  }

  async createOrder(props: { userId: number; body: CreateOrderBodyType }): Promise<CreateOrderResponseType> {
    const { userId, body: bodyOrderItems } = props;

    // 1. FlatMap cartItemIds
    const allBodyCartItemIds: number[] = bodyOrderItems.flatMap((item) => item.cartItemIds);

    // 2. Redis redlock: Lock tất cả sku cần mua để tránh race condition khi tạo order
    const cartItemsSkuIds = await this.orderRepository.findCartItemsSkuIds({
      userId,
      cartItemIds: allBodyCartItemIds,
    });

    const foundSkuIds = cartItemsSkuIds.map((item) => item.skuId);

    // Acquire locks for all skus
    const locks = await Promise.all(
      foundSkuIds.map((skuId) =>
        redlock.acquire(
          [`lock:sku:${skuId}`],
          3000, // 3000ms => giữ lock trong 3s
        ),
      ),
    ).catch(() => {
      throw ServerOverloadedException;
    });

    try {
      // 3. Create Transaction
      const { orders, paymentId } = await this._createOrderTransaction({
        userId,
        body: bodyOrderItems,
        allBodyCartItemIds,
      });

      // 4. Thêm job cancel payment vào queue
      // WARNING: Chạy promise này sau khi các tx, tránh trường hợp tx failed -> rollback -> job cancel payment vẫn được thực thi (tăng stock) -> bug
      // NOTE: chỉ chạy addJobCancelPayment khi tx commit thành công
      // addJobCancelPayment là chức năng tự động cancel payment sau 24h nếu order không được thanh toán
      await this.orderProducer.addJobCancelPayment(paymentId);

      return { data: orders };
    } finally {
      // 5. Giải phóng tất cả locks
      await Promise.all(locks.map((lock) => lock.release())).catch(() => {});
    }
  }

  @Transactional()
  private async _createOrderTransaction(props: {
    userId: number;
    body: CreateOrderBodyType;
    allBodyCartItemIds: number[];
  }) {
    const { userId, body: bodyOrderItems, allBodyCartItemIds } = props;

    // 1. Check duplicates
    const uniqueIds = new Set(allBodyCartItemIds);
    if (uniqueIds.size !== allBodyCartItemIds.length) {
      throw CartItemDuplicatedException;
    }

    // 2. Get cart items
    const cartItems = await this.orderRepository.findCartItems({
      userId,
      cartItemIds: allBodyCartItemIds,
    });

    // 3. Kiểm tra cartItemIds truyền lên có khớp với cartItems trong database không.
    if (cartItems.length !== allBodyCartItemIds.length) {
      throw CartItemNotFoundException; // Some cart items do not exist
    }

    // 4. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho không.
    const isOutOfStock = cartItems.some((cartItem) => {
      // cartItem.quantity luôn dương vì đã validate ở DTO
      return cartItem.sku.stock < cartItem.quantity;
    });

    if (isOutOfStock) {
      throw SkuOutOfStockException; // Some skus are out of stock
    }

    // 5. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xoá hay ẩn không.
    const isDeletedOrDraftOrNotPublished = cartItems.some((cartItem) => {
      const isDeleted = cartItem.sku.product.deletedAt !== null;
      const isDraft = cartItem.sku.product.publishedAt === null;
      const isNotPublished = cartItem.sku.product.publishedAt !== null && cartItem.sku.product.publishedAt > new Date();
      return isDeleted || isDraft || isNotPublished;
    });

    if (isDeletedOrDraftOrNotPublished) {
      throw ProductNotFoundException; // Some products are deleted or unpublished
    }

    // 6. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopId gửi lên không.
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

    if (isSkuNotBelongToShop) {
      throw SkuNotBelongToShopException; // Some skus are not belong to the same shop
    }

    // 7. Tạo order và Xoá cartItem
    // 7.1. Kiểm tra stock của sku
    const skuIds = cartItems.map((item) => item.skuId);
    const currentSkus = await this.orderRepository.findSkus(skuIds);

    const skuStockMap = new Map(currentSkus.map((s) => [s.id, s.stock]));

    for (const cartItem of cartItems) {
      const currentStock = skuStockMap.get(cartItem.sku.id)!;
      if (currentStock < cartItem.quantity) {
        throw SkuOutOfStockException;
      }
    }

    // 7.2 Tạo Payment với status PENDING
    const payment = await this.orderRepository.createPayment(EnumPaymentStatus.PENDING);

    // 7.3. Tạo order
    // NOTE: tại sao không dùng tx.order.createMany?
    // Vì createMany không hỗ trợ tạo relationship với các model khác.
    // Model cần tạo cùng với order là items (ProductSKUSnapshot[]) và products.
    const createdOrders: OrderType[] = [];
    for (const orderItem of bodyOrderItems) {
      const createdOrder = await this.orderRepository.createOrder({
        userId,
        paymentId: payment.id,
        status: EnumOrderStatus.PENDING_PAYMENT,
        orderItem,
        cartItemMap,
      });
      createdOrders.push(createdOrder);
    }

    // 7.4. Xoá cartItem
    await this.orderRepository.deleteCartItems(allBodyCartItemIds);

    // 7.5. Cập nhật stock của sku
    for (const cartItem of cartItems) {
      await this.orderRepository.updateSkusStock({
        skuId: cartItem.skuId,
        quantity: cartItem.quantity,
        updatedAt: cartItem.sku.updatedAt,
        isCreateOrder: true,
      });
    }

    // 7.6. Trả về order vừa tạo
    return { orders: createdOrders, paymentId: payment.id };
  }

  async getOrderById(props: { userId: number; id: number }): Promise<GetOrderResponseType> {
    try {
      const order = await this.orderRepository.findById(props);
      if (!order) {
        throw OrderNotFoundException;
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  @Transactional()
  async cancelOrder(props: { userId: number; id: number }): Promise<CancelOrderResponseType> {
    const { userId, id: orderId } = props;

    try {
      // Tạo transaction để update Payment Status, Order Status và cập nhật stock của sku
      // Chỉ được cancel order nếu status là PENDING_PAYMENT.
      const order = await this.orderRepository.findById({ userId, id: orderId });

      if (!order) {
        throw OrderNotFoundException;
      }

      if (order.status !== EnumOrderStatus.PENDING_PAYMENT) {
        throw CannotCancelOrderException;
      }

      // 2. update status của order thành CANCELLED
      const updatedOrder = await this.orderRepository.updateOrderById({
        userId,
        orderId,
        status: EnumOrderStatus.CANCELLED,
      });

      // 3. update status của payment thành FAILED
      await this.orderRepository.updatePaymentById({
        paymentId: order.paymentId,
        status: EnumPaymentStatus.FAILED,
      });

      // 4. update Stock items sku của order
      for (const sku of order.items) {
        if (!sku.skuId) {
          continue; // skip sku không có skuId, tương tự filter((sku) => Boolean(sku.skuId))
        }
        await this.orderRepository.updateSkusStock({
          skuId: sku.skuId as number,
          quantity: sku.quantity, // khôi phục stock của sku khi order bị cancelled
          isCreateOrder: false,
        });
      }

      return updatedOrder;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException;
      }
      throw error;
    }
  }
}
