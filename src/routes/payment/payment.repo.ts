import { PaymentTransactionType, WebhookPaymentBodyType } from '@/routes/payment/payment.type';
import { EnumOrderStatus, OrderStatusType } from '@/shared/constants/order.constant';
import { EnumPaymentStatus, PaymentStatusType } from '@/shared/constants/payment.constant';
import { PrismaService } from '@/shared/services/prisma.service';
import { PaymentIncludeOrdersType } from '@/shared/types/shared-payment.type';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { parse } from 'date-fns';

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaService>>,
  ) {}

  findPaymentTransactionById(id: number): Promise<PaymentTransactionType | null> {
    return this.prismaService.paymentTransaction.findUnique({
      where: {
        id,
      },
    });
  }

  async createPaymentTransaction(body: WebhookPaymentBodyType): Promise<PaymentTransactionType> {
    const {
      id,
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

    let amountIn = 0;
    let amountOut = 0;

    if (transferType === 'in') {
      amountIn = transferAmount;
    } else {
      amountOut = transferAmount;
    }

    const result = await this.txHost.tx.paymentTransaction.create({
      data: {
        id,
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

    return result;
  }

  findPaymentIncludeOrdersById(paymentId: number): Promise<PaymentIncludeOrdersType | null> {
    return this.txHost.tx.payment.findUnique({
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
  }

  updatePayment({ paymentId, status = EnumPaymentStatus.SUCCESS }: { paymentId: number; status: PaymentStatusType }) {
    return this.txHost.tx.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: status,
      },
    });
  }

  updateOrders({ orderIds, status = EnumOrderStatus.PENDING_PICKUP }: { orderIds: number[]; status: OrderStatusType }) {
    return this.txHost.tx.order.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: {
        status: status, // Cập nhật trạng thái đơn hàng thành "Chờ lấy hàng"
      },
    });
  }

  /**
   * Tăng soldCount atomic cho các launchpad orders khi thanh toán thành công.
   * Mỗi order có launchpadId sẽ tăng soldCount của launchpad đó lên 1.
   */
  async incrementLaunchpadSoldCounts(orderIds: number[]): Promise<void> {
    const launchpadOrders = await this.txHost.tx.order.findMany({
      where: {
        id: { in: orderIds },
        launchpadId: { not: null },
      },
      select: { launchpadId: true },
    });

    if (launchpadOrders.length === 0) return;

    // Deduplicate launchpadIds rồi increment từng cái
    const uniqueLaunchpadIds = [...new Set(launchpadOrders.map((o) => o.launchpadId!))];

    await Promise.all(
      uniqueLaunchpadIds.map((launchpadId) =>
        this.txHost.tx.launchpad.update({
          where: { id: launchpadId },
          data: { soldCount: { increment: 1 } },
        }),
      ),
    );
  }

  /**
   * Tài liệu tham khảo: https://docs.sepay.vn/lap-trinh-webhooks.html
   * Hàm này được gọi khi có giao dịch thanh toán mới được tạo trên hệ thống SePay.
   * Nếu hàm này bị failed thì chưa tăng stock của sku. Stock chỉ tăng khi payment transaction expired (khoảng 24h) mà user vẫn chưa thanh toàn thành công hoặc user bấm cancel order.
   */
  // async receiver(props: { body: WebhookPaymentBodyType }): Promise<number> {
  //   const { body } = props;
  //   const {
  //     id,
  //     gateway,
  //     transactionDate,
  //     accountNumber,
  //     code,
  //     content,
  //     transferType,
  //     transferAmount,
  //     accumulated,
  //     subAccount,
  //     referenceCode,
  //     description,
  //   } = body;

  //   let amountIn = 0;
  //   let amountOut = 0;

  //   if (transferType === 'in') {
  //     amountIn = transferAmount;
  //   } else {
  //     amountOut = transferAmount;
  //   }

  //   // 1. Kiểm tra payment transaction có tồn tại không.
  //   // Tránh case Sepay thanh toán lỗi thì nó sẽ retry lại và tạo transaction mới => ảnh hưởng tới stock của sku.
  //   const paymentTransaction = await this.prismaService.paymentTransaction.findUnique({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (paymentTransaction) {
  //     throw new BadRequestException(`Payment transaction with id ${id} already exists`);
  //   }

  //   // 2. Tạo transaction và cập nhật trạng thái thanh toán thành "Thành công" và đơn hàng thành "Chờ lấy hàng"
  //   const userId = await this.prismaService.$transaction(async (tx) => {
  //     // 2.1. Thêm payment transaction vào database
  //     await this.prismaService.paymentTransaction.create({
  //       data: {
  //         id,
  //         gateway,
  //         transactionDate: parse(transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
  //         accountNumber,
  //         subAccount,
  //         amountIn,
  //         amountOut,
  //         accumulated,
  //         code,
  //         transactionContent: content,
  //         referenceNumber: referenceCode,
  //         body: description,
  //       },
  //     });

  //     // 2.2. Kiểm tra nội dung chuyển khoản và tổng số tiền có đúng không.
  //     const paymentId = code
  //       ? Number(code.split(PREFIX_PAYMENT_CODE)[1])
  //       : Number(content?.split(PREFIX_PAYMENT_CODE)[1]);

  //     // 2.3. Kiểm tra mã thanh toán có hợp lệ không.
  //     if (isNaN(paymentId)) {
  //       throw new BadRequestException('Invalid payment code');
  //     }

  //     // 2.4. Kiểm tra tổng số tiền có đúng không.
  //     const payment = await this.prismaService.payment.findUnique({
  //       where: {
  //         id: paymentId,
  //       },
  //       include: {
  //         orders: {
  //           include: {
  //             // items (ProductSkuSnapshot[])
  //             items: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!payment) {
  //       throw new BadRequestException(`Payment with id ${paymentId} not found`);
  //     }

  //     const { orders } = payment;
  //     const userId = orders[0].userId;

  //     const totalAmount = this._getTotalAmount(orders);

  //     if (totalAmount !== transferAmount) {
  //       throw new BadRequestException(`Total amount mismatch. Expected ${totalAmount}, got ${transferAmount}`);
  //     }

  //     // 2.5. Cập nhật trạng thái đơn hàng
  //     // 2.5.1. Cập nhật trạng thái thanh toán thành "Thành công"
  //     const updatedPaymentPromise = tx.payment.update({
  //       where: {
  //         id: paymentId,
  //       },
  //       data: {
  //         status: EnumPaymentStatus.SUCCESS,
  //       },
  //     });

  //     // 2.5.2. Cập nhật trạng thái đơn hàng thành "Chờ lấy hàng"
  //     const updatedOrderPromise = tx.order.updateMany({
  //       where: {
  //         id: {
  //           in: orders.map((order) => order.id),
  //         },
  //       },
  //       data: {
  //         status: EnumOrderStatus.PENDING_PICKUP, // Cập nhật trạng thái đơn hàng thành "Chờ lấy hàng"
  //       },
  //     });

  //     // 2.5.3. Xoá job cancel payment khỏi queue
  //     const removedJobPromise = this.paymentProducer.removeJob(paymentId);

  //     await Promise.all([updatedPaymentPromise, updatedOrderPromise, removedJobPromise]);

  //     return userId;
  //   });

  //   // 3. Trả về message thành công
  //   return userId;
  // }

  // private _getTotalAmount(orders: OrderIncludeProductSkuSnapshotType[]): number {
  //   return orders.reduce((total, order) => {
  //     const orderTotal = order.items.reduce((totalPrice, productSku) => {
  //       return totalPrice + productSku.skuPrice * productSku.quantity;
  //     }, 0);
  //     return total + orderTotal;
  //   }, 0);
  // }
}
