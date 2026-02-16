import { PaymentRepository } from '@/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from '@/routes/payment/payment.type';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus, PREFIX_PAYMENT_CODE } from '@/shared/constants/payment.constant';
import { generateRoomUserId } from '@/shared/helpers';
import { OrderIncludeProductSkuSnapshotType } from '@/shared/types/shared-order.type';
// import { SharedWebSocketRepository } from '@/shared/repositories/shared-websocket.repo';
import { PaymentProducer } from '@/routes/payment/payment.producer';
import envConfig from '@/shared/config';
import { Momo, VNPay } from '@/shared/payment-providers';
import PaymentFactory from '@/shared/payment-providers/core';
import { EnumPaymentMethod } from '@/shared/payment-providers/core/constants';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Transactional } from '@nestjs-cls/transactional';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server;
  private readonly vnpay: PaymentFactory<typeof EnumPaymentMethod.VNPAY>;
  private readonly momo: PaymentFactory<typeof EnumPaymentMethod.MOMO>;

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentProducer: PaymentProducer,
    // private readonly sharedWebSocketRepository: SharedWebSocketRepository,
  ) {
    this.vnpay = new PaymentFactory(EnumPaymentMethod.VNPAY, {
      tmnCode: envConfig.VNPAY_TMN_CODE, // 'RC08SQWC',
      secureSecret: envConfig.VNPAY_SECURE_SECRET, // '38HBCBH9A5KZBN9TC2E9OZNDE9BX5OF1',
      vnpayHost: envConfig.VNPAY_HOST, // 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      testMode: true,
      hashAlgorithm: VNPay.HashAlgorithm.SHA512,
    });

    this.momo = new PaymentFactory(EnumPaymentMethod.MOMO, {
      partnerCode: 'MOMO',
      accessKey: 'F8BBA842ECF85',
      secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
      storeId: 'MomoTestStore',
      storeName: 'Test',
      requestType: Momo.RequestType.PAY_WITH_METHOD,
      lang: Momo.MomoLocale.VI,
    });
  }

  /**
   * Sepay callback
   * Tài liệu tham khảo: https://docs.sepay.vn/lap-trinh-webhooks.html
   * Hàm này được gọi khi có giao dịch thanh toán mới được tạo trên hệ thống SePay.
   * Nếu hàm này bị failed thì chưa tăng stock của sku. Stock chỉ tăng khi payment transaction expired (khoảng 24h) mà user vẫn chưa thanh toàn thành công hoặc user bấm cancel order.
   */
  async receiver(props: { body: WebhookPaymentBodyType }): Promise<MessageResponseType> {
    const { body } = props;
    const { id } = body;

    // 1. Kiểm tra payment transaction có tồn tại không.
    // Tránh case Sepay thanh toán lỗi thì nó sẽ retry lại và tạo transaction mới => ảnh hưởng tới stock của sku.
    const paymentTransaction = await this.paymentRepository.findPaymentTransactionById(id);

    if (paymentTransaction) {
      throw new BadRequestException(`Payment transaction with id ${id} already exists`);
    }

    // 2. Tạo transaction và cập nhật trạng thái thanh toán thành "Thành công" và đơn hàng thành "Chờ lấy hàng"
    const { userId, paymentId } = await this._createPaymentTransaction(props);

    // 3. Xoá job cancel payment khỏi queue
    await this.paymentProducer.removeJob(paymentId);

    // 4. Emit socket event payment successful to client
    // Cách 1:
    // // 2. Find all web sockets of user and emit event payment successful to client
    // const webSockets = await this.sharedWebSocketRepository.findMany(userId).catch(() => []);
    // webSockets.forEach((webSocket) => {
    //   // Response for client
    //   this.server.to(webSocket.id).emit('payment', { message: 'Payment successful' });
    // });

    // Cách 2: Sử dụng tính năng "Room" của socket.io => emit event tới room chứa các userId đã được join ở websocket.adpater.ts
    this.server.to(generateRoomUserId(userId)).emit('payment', { message: 'Payment successful' });

    // 5. Return message response (response for Sepay)
    return { message: 'Payment successful' };
  }

  @Transactional()
  private async _createPaymentTransaction(props: {
    body: WebhookPaymentBodyType;
  }): Promise<{ userId: number; paymentId: number }> {
    const { body } = props;
    const { code, content, transferAmount } = body;

    // 1. Thêm payment transaction vào database
    await this.paymentRepository.createPaymentTransaction(body);

    // 2. Kiểm tra nội dung chuyển khoản và tổng số tiền có đúng không.
    const paymentId = code
      ? Number(code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(content?.split(PREFIX_PAYMENT_CODE)[1]);

    // 3. Kiểm tra mã thanh toán có hợp lệ không.
    if (isNaN(paymentId)) {
      throw new BadRequestException('Invalid payment code');
    }

    // 4. Kiểm tra tổng số tiền có đúng không.
    const payment = await this.paymentRepository.findPaymentIncludeOrdersById(paymentId);

    if (!payment) {
      throw new BadRequestException(`Payment with id ${paymentId} not found`);
    }

    const { orders } = payment;
    const userId = orders[0].userId;

    const totalAmount = this._getTotalAmount(orders);

    if (totalAmount !== transferAmount) {
      throw new BadRequestException(`Total amount mismatch. Expected ${totalAmount}, got ${transferAmount}`);
    }

    // 5. Cập nhật trạng thái đơn hàng
    // 5.1. Cập nhật trạng thái thanh toán thành "Thành công"
    await this.paymentRepository.updatePayment({
      paymentId,
      status: EnumPaymentStatus.SUCCESS,
    });

    // 5.2. Cập nhật trạng thái đơn hàng thành "Chờ lấy hàng"
    await this.paymentRepository.updateOrders({
      orderIds: orders.map((order) => order.id),
      status: EnumOrderStatus.PENDING_PICKUP,
    });

    return { userId, paymentId };
  }

  private _getTotalAmount(orders: OrderIncludeProductSkuSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((totalPrice, productSku) => {
        return totalPrice + productSku.skuPrice * productSku.quantity;
      }, 0);
      return total + orderTotal;
    }, 0);
  }

  async verifyIpnMomo(body: Momo.ReturnQueryFromMomo): Promise<void> {
    // 1. Verify signature validity
    const ipn = this.momo.verifyIpnCall(body);

    if (!ipn.isVerified) {
      throw new BadRequestException('Invalid signature');
    }

    // 2. Extract payment ID from orderId (format: "userId-paymentId")
    const paymentId = Number(ipn.orderId.split('-')[1]);

    if (isNaN(paymentId)) {
      throw new BadRequestException('Invalid orderId format');
    }

    // 3. Find payment and orders in database
    const payment = await this.paymentRepository.findPaymentIncludeOrdersById(paymentId);

    if (!payment) {
      throw new BadRequestException(`Payment with id ${paymentId} not found`);
    }

    const { orders } = payment;
    const userId = orders[0].userId;

    // 4. Validate partnerCode matches (using hardcoded value from constructor)
    if (ipn.partnerCode !== 'MOMO') {
      throw new BadRequestException('Invalid partnerCode');
    }

    // 5. Validate amount matches
    const totalAmount = this._getTotalAmount(orders);

    if (totalAmount !== ipn.amount) {
      throw new BadRequestException(`Total amount mismatch. Expected ${totalAmount}, got ${ipn.amount}`);
    }

    // 6. Check transaction result code
    // resultCode = 0: transaction success
    // resultCode = 9000: transaction authorized successfully
    // resultCode <> 0 and <> 9000: transaction failed
    if (ipn.resultCode !== 0 && ipn.resultCode !== 9000) {
      // Note: According to MoMo docs, in some cases (insufficient balance/amount check),
      // MoMo won't use IPN result to refund transaction
      throw new BadRequestException(`Transaction failed: ${ipn.message}`);
    }

    // 7. Update payment and order status
    // 7.1. Update payment status to SUCCESS
    await this.paymentRepository.updatePayment({
      paymentId,
      status: EnumPaymentStatus.SUCCESS,
    });

    // 7.2. Update order status to PENDING_PICKUP
    await this.paymentRepository.updateOrders({
      orderIds: orders.map((order) => order.id),
      status: EnumOrderStatus.PENDING_PICKUP,
    });

    // 8. Remove cancel payment job from queue
    // await this.paymentProducer.removeJob(paymentId);

    // 9. Emit socket event to notify user
    this.server.to(generateRoomUserId(userId)).emit('payment', { message: 'Payment successful' });

    // Return void - Controller will respond with HTTP 204 (No Content)
  }

  async verifyReturnMomo(query: Momo.ReturnQueryFromMomo): Promise<MessageResponseType> {
    let verify: Momo.VerifyReturnUrl;
    try {
      verify = this.momo.verifyReturnUrl(query, {
        logger: {
          type: 'pick',
          fields: ['createdAt', 'method', 'isVerified', 'message'], // Select fields want to log
          loggerFn: (data) => console.log(data), // Log to console, or use your custom logger
        },
      });
      console.log('verify: ', verify);
      if (!verify.isVerified) {
        throw new BadRequestException('Payment failed!');
      }
    } catch (error) {
      console.log(`verify error: ${error}`);
      throw new BadRequestException('verify error');
    }

    return { message: 'Payment successful!' };
  }

  async verifyIpnVNPay(query: VNPay.ReturnQueryFromVNPay): Promise<VNPay.IpnResponse> {
    // const vnp_Amount = '87000000';
    // const vnp_BankCode = 'NCB';
    // const vnp_BankTranNo = 'VNP15427618';
    // const vnp_CardType = 'ATM';
    // const vnp_OrderInfo = 'Payment for order 20';
    // const vnp_PayDate = '20260213211739';
    // const vnp_ResponseCode = '00';
    // const vnp_TmnCode = '9WF2MUGH';
    // const vnp_TransactionNo = '15427618';
    // const vnp_TransactionStatus = '00';
    // const vnp_TxnRef = '20-23';
    // const vnp_SecureHash = 'eda9bf4c7bbff0b8e3b602b23ac6c24c7d0e066f73ee29ad6f3cb05d66ef3517fc1eca7b73e38d7cd7a4b455f4fc26153e1a83b86168dcc5933c6a7dc7fea6fd';

    // 1. Verify signature validity
    const ipn = this.vnpay.verifyIpnCall(query);

    if (!ipn.isVerified) {
      return VNPay.IpnFailChecksum;
    }

    // 2. Extract payment ID from vnp_TxnRef (format: "userId-paymentId")
    const paymentId = Number(ipn.vnp_TxnRef.split('-')[1]);

    // 3. Find payment and orders in database
    const payment = await this.paymentRepository.findPaymentIncludeOrdersById(paymentId);

    if (!payment) {
      return VNPay.IpnOrderNotFound; // Payment with id ${paymentId} not found
    }

    const { orders } = payment;
    const userId = orders[0].userId;

    // 4. Validate total amount matches
    const totalAmount = this._getTotalAmount(orders);

    if (totalAmount !== ipn.vnp_Amount) {
      return VNPay.IpnInvalidAmount; // Total amount mismatch. Expected ${totalAmount}, got ${ipn.vnp_Amount}
    }

    // 5. Update payment and order status
    // 5.1. Cập nhật trạng thái thanh toán thành "Thành công"
    await this.paymentRepository.updatePayment({
      paymentId,
      status: EnumPaymentStatus.SUCCESS,
    });

    // 5.2. Cập nhật trạng thái đơn hàng thành "Chờ lấy hàng"
    await this.paymentRepository.updateOrders({
      orderIds: orders.map((order) => order.id),
      status: EnumOrderStatus.PENDING_PICKUP,
    });

    // 6. Remove cancel payment job from queue
    // await this.paymentProducer.removeJob(paymentId);

    // 7. Emit socket event payment successful to client
    this.server.to(generateRoomUserId(userId)).emit('payment', { message: 'Payment successful' });

    // Then return the success response to VNPay
    return VNPay.IpnSuccess;
  }

  async verifyReturnVNPay(query: VNPay.ReturnQueryFromVNPay): Promise<MessageResponseType> {
    let verify: VNPay.VerifyReturnUrl;
    try {
      verify = await this.vnpay.verifyReturnUrl(query, {
        logger: {
          type: 'pick',
          fields: ['createdAt', 'method', 'isVerified', 'message'], // Select fields want to log
          loggerFn: (data) => console.log(data), // Log to console, or use your custom logger
        },
      });
      if (!verify.isVerified) {
        throw new BadRequestException('Payment failed!');
      }
    } catch (error) {
      console.log(`verify error: ${error}`);
      throw new BadRequestException('verify error');
    }

    return { message: 'Payment successful!' };
  }
}
