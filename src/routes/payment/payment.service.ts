import { PaymentRepository } from '@/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from '@/routes/payment/payment.type';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus, PREFIX_PAYMENT_CODE } from '@/shared/constants/payment.constant';
import { generateRoomUserId } from '@/shared/helpers';
import { OrderIncludeProductSkuSnapshotType } from '@/shared/types/shared-order.type';
// import { SharedWebSocketRepository } from '@/shared/repositories/shared-websocket.repo';
import { PaymentProducer } from '@/routes/payment/payment.producer';
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

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentProducer: PaymentProducer,
    // private readonly sharedWebSocketRepository: SharedWebSocketRepository,
  ) {}

  /**
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

    // 4. Emit event payment successful to client
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
}
