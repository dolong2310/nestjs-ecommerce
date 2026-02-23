import { PaymentProducer } from '@/routes/payment/payment.producer';
import { PaymentRepository } from '@/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from '@/routes/payment/payment.type';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus, PREFIX_PAYMENT_CODE } from '@/shared/constants/payment.constant';
import { generateRoomUserId } from '@/shared/helpers';
import { Momo, VNPay } from '@/shared/payment-providers';
import { EnumPaymentMethod } from '@/shared/payment-providers/core';
import { getResponseByStatusCode as getMessageMomo } from '@/shared/payment-providers/momo';
import { getResponseByStatusCode as getMessageVNPay } from '@/shared/payment-providers/vnpay';
import { SharedPaymentService } from '@/shared/services/shared-payment.service';
import { OrderIncludeProductSkuSnapshotType } from '@/shared/types/shared-order.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Transactional } from '@nestjs-cls/transactional';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { format, parse } from 'date-fns';
import { Server } from 'socket.io';

// import { SharedWebSocketRepository } from '@/shared/repositories/shared-websocket.repo';

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentProducer: PaymentProducer,
    private readonly sharedPaymentService: SharedPaymentService,
    // private readonly sharedWebSocketRepository: SharedWebSocketRepository,
  ) {}

  /**
   * Sepay callback
   * Tài liệu tham khảo: https://docs.sepay.vn/lap-trinh-webhooks.html
   * Hàm này được gọi khi có giao dịch thanh toán mới được tạo trên hệ thống SePay.
   * Nếu hàm này bị failed thì chưa tăng stock của sku. Stock chỉ tăng khi payment transaction expired (khoảng 24h) mà user vẫn chưa thanh toàn thành công hoặc user bấm cancel order.
   */
  async receiver(props: { body: WebhookPaymentBodyType }): Promise<MessageResponseType> {
    const { body } = props;
    const { id, code, content, transferAmount } = body;

    // 1. Kiểm tra payment transaction có tồn tại không.
    // Tránh case Sepay thanh toán lỗi thì nó sẽ retry lại và tạo transaction mới => ảnh hưởng tới stock của sku.
    const paymentTransaction = await this.paymentRepository.findPaymentTransactionById(id);

    if (paymentTransaction) {
      throw new BadRequestException(`Payment transaction with id ${id} already exists`);
    }

    // 2. Tạo transaction và cập nhật trạng thái thanh toán thành "Thành công" và đơn hàng thành "Chờ lấy hàng"
    const paymentId = code
      ? Number(code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(content?.split(PREFIX_PAYMENT_CODE)[1]);

    const userId = await this._createPaymentTransaction({
      paymentId: paymentId,
      transferAmount: transferAmount,
      body: body,
    });

    // 3. Remove cancel payment job and emit socket event
    await this._removeCancelPaymentJobAndEmitSocketEvent({ paymentId, userId });

    // 4. Return message response (response for Sepay)
    return { message: 'Payment successful' };
  }

  async verifyIpnMomo(body: Momo.ReturnQueryFromMomo): Promise<void> {
    // const orderType = "momo_wallet";
    // const amount = 87000000;
    // const partnerCode = "MOMO";
    // const orderId = "20-23";
    // const extraData = "userId-paymentId-cartItems-ip";
    // const signature = "7b9f4ca728076c32f16041cbc917ebf5e6e7359f0bde343dde3add69a518cf0d";
    // const transId = 4088878653;
    // const responseTime = 1721720663942;
    // const resultCode = 0;
    // const message = "Successful.";
    // const payType = "qr"; // webApp, app,qr hoặc miniapp
    // const requestId = "uuidv4";
    // const orderInfo = "Thanh toan cho don hang 20";

    // 1. Verify signature validity
    const ipn = this.sharedPaymentService.momo.verifyIpnCall(body);

    if (!ipn.isVerified) {
      throw new BadRequestException('Invalid signature');
    }

    if (ipn.partnerCode !== 'MOMO') {
      throw new BadRequestException('Invalid partnerCode');
    }

    // resultCode = 0: transaction success
    // resultCode = 9000: transaction authorized successfully
    // resultCode <> 0 and <> 9000: transaction failed
    if (ipn.resultCode !== 0 && ipn.resultCode !== 9000) {
      // Note: According to MoMo docs, in some cases (insufficient balance/amount check),
      // MoMo won't use IPN result to refund transaction
      throw new BadRequestException(`Transaction failed: ${ipn.message}`);
    }

    const paymentId = Number(ipn.orderId.split('-')[1]);
    const accountNumber = String(ipn.orderId.split('-')[0]);
    const transactionId = ipn.transId;
    const transferAmount = ipn.amount;
    const transactionDate = format(
      parse(String(ipn.responseTime), 'yyyyMMddHHmmss', new Date()),
      'yyyy-MM-dd HH:mm:ss',
    );
    const orderInfo = ipn.orderInfo;
    const description = getMessageMomo(ipn.resultCode);

    // 2. Kiểm tra payment transaction có tồn tại không.
    const paymentTransaction = await this.paymentRepository.findPaymentTransactionById(transactionId);

    if (paymentTransaction) {
      throw new BadRequestException(`Payment transaction with id ${transactionId} already exists`);
    }

    // 3. Create payment transaction
    const userId = await this._createPaymentTransaction({
      paymentId,
      transferAmount,
      body: {
        id: transactionId,
        gateway: 'MoMo', // EnumPaymentMethod.MOMO,
        transactionDate,
        accountNumber,
        code: null,
        content: orderInfo,
        transferType: 'in',
        transferAmount,
        accumulated: 0,
        subAccount: null,
        referenceCode: null,
        description,
      },
    });

    // 4. Remove cancel payment job and emit socket event
    await this._removeCancelPaymentJobAndEmitSocketEvent({ paymentId, userId });

    // Return void - Controller will respond with HTTP 204 (No Content)
  }

  async verifyIpnVNPay(query: VNPay.ReturnQueryFromVNPay): Promise<VNPay.IpnResponse> {
    // const vnp_Amount = '87000000';
    // const vnp_BankCode = 'NCB';
    // const vnp_BankTranNo = 'VNP15427618';
    // const vnp_CardType = 'ATM';
    // const vnp_OrderInfo = 'Thanh toan cho don hang 20';
    // const vnp_PayDate = '20260221211001';
    // const vnp_ResponseCode = '00';
    // const vnp_TmnCode = '9WF2MUGH';
    // const vnp_TransactionNo = '15427618';
    // const vnp_TransactionStatus = '00';
    // const vnp_TxnRef = '20-23';
    // const vnp_SecureHash = 'eda9bf4c7bbff0b8e3b602b23ac6c24c7d0e066f73ee29ad6f3cb05d66ef3517fc1eca7b73e38d7cd7a4b455f4fc26153e1a83b86168dcc5933c6a7dc7fea6fd';

    try {
      // 1. Verify signature validity
      const ipn = this.sharedPaymentService.vnpay.verifyIpnCall(query);

      if (!ipn.isVerified) {
        return VNPay.IpnFailChecksum;
      }

      const paymentId = Number(ipn.vnp_TxnRef.split('-')[1]);
      const accountNumber = String(ipn.vnp_TxnRef.split('-')[0]);
      const transactionId = Number(ipn.vnp_TransactionNo);
      const transferAmount = Number(ipn.vnp_Amount);
      const transactionDate = format(
        parse(String(ipn.vnp_PayDate), 'yyyyMMddHHmmss', new Date()),
        'yyyy-MM-dd HH:mm:ss',
      );
      const orderInfo = ipn.vnp_OrderInfo;
      const description = getMessageVNPay(String(ipn.vnp_ResponseCode));

      // 2. Kiểm tra payment transaction có tồn tại không.
      const paymentTransaction = await this.paymentRepository.findPaymentTransactionById(transactionId);

      if (paymentTransaction) {
        return VNPay.InpOrderAlreadyConfirmed;
      }

      // 3. create payment transaction
      const userId = await this._createPaymentTransaction(
        {
          paymentId,
          transferAmount,
          body: {
            id: transactionId,
            gateway: 'VNPay', // EnumPaymentMethod.VNPAY,
            transactionDate,
            accountNumber,
            code: null,
            content: orderInfo,
            transferType: 'in',
            transferAmount,
            accumulated: 0,
            subAccount: null,
            referenceCode: null,
            description,
          },
        },
        {
          isVnpay: true,
        },
      );

      // 4. Remove cancel payment job and emit socket event
      await this._removeCancelPaymentJobAndEmitSocketEvent({ paymentId, userId });

      return VNPay.IpnSuccess;
    } catch (error) {
      if (error && typeof error === 'object' && 'RspCode' in error) {
        return error as VNPay.IpnResponse;
      }
      return VNPay.IpnUnknownError; // fallback system error
    }
  }

  @Transactional()
  private async _createPaymentTransaction(
    props: {
      paymentId: number;
      transferAmount: number;
      body: WebhookPaymentBodyType;
    },
    options?: {
      isVnpay?: boolean;
    },
  ): Promise<number> {
    const { paymentId, transferAmount, body } = props;
    const { isVnpay = false } = options ?? {};

    // 1. Thêm payment transaction vào database
    await this.paymentRepository.createPaymentTransaction(body);

    // 3. Kiểm tra mã thanh toán có hợp lệ không.
    if (isNaN(paymentId)) {
      throw isVnpay ? VNPay.IpnUnknownError : new BadRequestException('Invalid payment code');
    }

    // 4. Kiểm tra tổng số tiền có đúng không.
    const payment = await this.paymentRepository.findPaymentIncludeOrdersById(paymentId);

    if (!payment) {
      throw isVnpay ? VNPay.IpnOrderNotFound : new BadRequestException(`Payment with id ${paymentId} not found`);
    }

    const { orders } = payment;
    const userId = orders[0].userId;

    const totalAmount = this._getTotalAmount(orders);

    if (totalAmount !== transferAmount) {
      throw isVnpay
        ? VNPay.IpnInvalidAmount
        : new BadRequestException(`Total amount mismatch. Expected ${totalAmount}, got ${transferAmount}`);
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

    return userId;
  }

  verifyReturnMomo(query: Momo.ReturnQueryFromMomo): MessageResponseType {
    let verify: Momo.VerifyReturnUrl;
    try {
      verify = this.sharedPaymentService.momo.verifyReturnUrl(query, {
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

  verifyReturnVNPay(query: VNPay.ReturnQueryFromVNPay): MessageResponseType {
    let verify: VNPay.VerifyReturnUrl;
    try {
      verify = this.sharedPaymentService.vnpay.verifyReturnUrl(query, {
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

  private _getTotalAmount(orders: OrderIncludeProductSkuSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((totalPrice, productSku) => {
        return totalPrice + productSku.skuPrice * productSku.quantity;
      }, 0);
      return total + orderTotal;
    }, 0);
  }

  private async _removeCancelPaymentJobAndEmitSocketEvent({
    paymentId,
    userId,
  }: {
    paymentId: number;
    userId: number;
  }): Promise<void> {
    // 1. Remove cancel payment job from queue
    await this.paymentProducer.removeJob(paymentId);

    // 2. Emit socket event to notify user
    // Cách 1:
    // Find all web sockets of user and emit event payment successful to client
    // const webSockets = await this.sharedWebSocketRepository.findMany(userId).catch(() => []);
    // webSockets.forEach((webSocket) => {
    //   this.server.to(webSocket.id).emit('payment', { message: 'Payment successful' }); // Response for client
    // });

    // Cách 2: Sử dụng tính năng "Room" của socket.io => emit event tới room chứa các userId đã được join ở websocket.adpater.ts
    this.server.to(generateRoomUserId(userId)).emit('payment', { message: 'Payment successful' });
  }
}
