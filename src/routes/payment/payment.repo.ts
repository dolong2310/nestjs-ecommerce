import { WebhookPaymentBodyType } from '@/routes/payment/payment.type';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus, PREFIX_PAYMENT_CODE } from '@/shared/constants/payment.constant';
import { PrismaService } from '@/shared/services/prisma.service';
import { OrderIncludeProductSkuSnapshotType } from '@/shared/types/shared-order.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'date-fns';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Tài liệu tham khảo: https://docs.sepay.vn/lap-trinh-webhooks.html
   * Hàm này được gọi khi có giao dịch thanh toán mới được tạo trên hệ thống SePay.
   * Nếu hàm này bị failed thì chưa tăng stock của sku. Stock chỉ tăng khi payment transaction expired (khoảng 24h) mà user vẫn chưa thanh toàn thành công hoặc user bấm cancel order.
   */
  async receiver(props: { body: WebhookPaymentBodyType }): Promise<MessageResponseType> {
    const { body } = props;
    const {
      gateway,
      transactionDate,
      accountNumber,
      code,
      content,
      transferType,
      transferAmount,
      accumulated,
      subAccount,
      referenceCode,
      description,
    } = body;

    // 1. Thêm thông tin giao dịch vào database
    let amountIn = 0;
    let amountOut = 0;

    if (transferType === 'in') {
      amountIn = transferAmount;
    } else {
      amountOut = transferAmount;
    }

    await this.prismaService.paymentTransaction.create({
      data: {
        gateway,
        transactionDate: parse(transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
        accountNumber,
        subAccount,
        amountIn,
        amountOut,
        accumulated,
        code,
        transactionContent: content,
        referenceNumber: referenceCode,
        body: description,
      },
    });

    // 2. Kiểm tra nội dung chuyển khoản và tổng số tiền có đúng không.
    const paymentId = code
      ? Number(code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(content?.split(PREFIX_PAYMENT_CODE)[1]);

    // 2.1. Kiểm tra mã thanh toán có hợp lệ không.
    if (isNaN(paymentId)) {
      throw new BadRequestException('Invalid payment code');
    }

    // 2.2. Kiểm tra tổng số tiền có đúng không.
    const payment = await this.prismaService.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        orders: {
          include: {
            // items (ProductSkuSnapshot[])
            items: true,
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with id ${paymentId} not found`);
    }

    const { orders } = payment;

    const totalAmount = this._getTotalAmount(orders);

    if (totalAmount !== transferAmount) {
      throw new BadRequestException(`Total amount mismatch. Expected ${totalAmount}, got ${transferAmount}`);
    }

    // 3. Cập nhật trạng thái đơn hàng
    await this.prismaService.$transaction(async (tx) => {
      // 3.1. Cập nhật trạng thái thanh toán thành "Thành công"
      await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: EnumPaymentStatus.SUCCESS,
        },
      });

      // 3.2. Cập nhật trạng thái đơn hàng thành "Chờ lấy hàng"
      await tx.order.updateMany({
        where: {
          id: {
            in: orders.map((order) => order.id),
          },
        },
        data: {
          status: EnumOrderStatus.PENDING_PICKUP, // Cập nhật trạng thái đơn hàng thành "Chờ lấy hàng"
        },
      });
    });

    // 4. Trả về message thành công
    return { message: 'Payment Successful' };
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
