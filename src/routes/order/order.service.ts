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
import envConfig from '@/shared/config';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus } from '@/shared/constants/payment.constant';
import {
  CartItemNotFoundException,
  ProductNotFoundException,
  ServerOverloadedException,
} from '@/shared/errors/shared-error.error';
import { isNotFoundPrismaError } from '@/shared/helpers';
import PaymentFactory from '@/shared/payment-providers/core';
import { EnumPaymentMethod, PaymentMethod } from '@/shared/payment-providers/core/constants';
import { Momo, VNPay } from '@/shared/payment-providers';
import { CartItemIncludeSkuAndProductType } from '@/shared/types/shared-cart.type';
import { OrderType } from '@/shared/types/shared-order.type';
import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderProducer: OrderProducer,
  ) {}

  getOrders(props: { userId: number; query: GetOrdersQueryType }): Promise<GetOrdersResponseType> {
    return this.orderRepository.findMany(props);
  }

  async createOrder(props: {
    userId: number;
    body: CreateOrderBodyType;
    ip: string;
  }): Promise<CreateOrderResponseType> {
    const { userId, body: bodyOrderItems, ip } = props;

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
      const { orders, paymentId, cartItems } = await this._createOrderTransaction({
        userId,
        body: bodyOrderItems,
        allBodyCartItemIds,
      });

      // 4. Thêm job cancel payment vào queue
      // WARNING: Chạy promise này sau khi các tx, tránh trường hợp tx failed -> rollback -> job cancel payment vẫn được thực thi (tăng stock) -> bug
      // NOTE: chỉ chạy addJobCancelPayment khi tx commit thành công
      // addJobCancelPayment là chức năng tự động cancel payment sau 24h nếu order không được thanh toán
      await this.orderProducer.addJobCancelPayment(paymentId);

      // Nếu thanh toán bằng vnpay (hoặc momo, zalopay, ...) thì trả về URL thanh toán (hoặc redirect trực tiếp bằng server)
      let paymentUrl: string | null = null;
      if (true) {
        paymentUrl = await this._buildPaymentUrl({ method: EnumPaymentMethod.MOMO, userId, paymentId, cartItems, ip });
      }

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
    return { orders: createdOrders, paymentId: payment.id, cartItems };
  }

  private async _buildPaymentUrl({
    method,
    userId,
    paymentId,
    cartItems,
    ip,
  }: {
    method: PaymentMethod;
    userId: number;
    paymentId: number;
    cartItems: CartItemIncludeSkuAndProductType[];
    ip: string;
  }) {
    const totalAmount = cartItems.reduce((total, cartItem) => {
      return total + cartItem.sku.price * cartItem.quantity;
    }, 0);
    console.log('totalAmount: ', totalAmount);

    if (method === EnumPaymentMethod.MOMO) {
      const momo = new PaymentFactory(EnumPaymentMethod.MOMO, {
        partnerCode: 'MOMO',
        accessKey: 'F8BBA842ECF85',
        secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
        storeId: 'MomoTestStore',
        storeName: 'Test',
        requestType: Momo.RequestType.PAY_WITH_METHOD,
        lang: Momo.MomoLocale.VI,
        testMode: true,
      });

      const paymentUrl = await momo.buildPaymentUrl({
        requestId: uuidv4(),
        amount: totalAmount,
        orderId: `${userId}-${paymentId}`,
        orderInfo: `Thanh toan cho don hang ${userId}`,
        redirectUrl: 'https://a2dd-123-21-214-156.ngrok-free.app/api/v1/payment/momo-return',
        ipnUrl: 'https://a2dd-123-21-214-156.ngrok-free.app/api/v1/payment/momo-ipn',
        extraData: JSON.stringify({
          userId,
          paymentId,
          cartItems,
          ip,
        }),
        items: cartItems.map((cartItem) => ({
          id: cartItem.sku.id.toString(),
          name: cartItem.sku.value,
          price: cartItem.sku.price,
          quantity: cartItem.quantity,
          currency: 'VND',
          totalPrice: cartItem.sku.price * cartItem.quantity,
        })),
        deliveryInfo: {
          deliveryAddress: '123 Nguyen Van Linh, Q9, TP.HCM',
          deliveryFee: '10000',
          quantity: '1',
        },
        userInfo: {
          name: 'John Doe',
          phoneNumber: '0909090909',
          email: 'john.doe@example.com',
        },
        // subPartnerCode
        // storeName
        // requestType
        // orderGroupId
        // referenceId
        // autoCapture
        // lang
      });
      console.log('paymentUrl momo: ', paymentUrl);
      return paymentUrl;
    }

    const vnpay = new PaymentFactory(EnumPaymentMethod.VNPAY, {
      tmnCode: envConfig.VNPAY_TMN_CODE, // 'RC08SQWC',
      secureSecret: envConfig.VNPAY_SECURE_SECRET, // '38HBCBH9A5KZBN9TC2E9OZNDE9BX5OF1',
      vnpayHost: envConfig.VNPAY_HOST, // 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      testMode: true,
      hashAlgorithm: VNPay.HashAlgorithm.SHA512,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: totalAmount,
      vnp_IpAddr: ip, // '127.0.0.1'
      vnp_TxnRef: `${userId}-${paymentId}`,
      vnp_OrderInfo: `Thanh toan cho don hang ${userId}`,
      vnp_OrderType: VNPay.ProductCode.Other,
      vnp_ReturnUrl: 'http://localhost:8080/api/v1/payment/vnpay-return',
      vnp_Locale: VNPay.VnpLocale.VN,
      vnp_CreateDate: VNPay.dateFormat(new Date()),
      vnp_ExpireDate: VNPay.dateFormat(tomorrow),
    });
    console.log('paymentUrl vnpay: ', paymentUrl);

    return paymentUrl;
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
