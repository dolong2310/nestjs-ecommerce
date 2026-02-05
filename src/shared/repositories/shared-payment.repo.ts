import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus } from '@/shared/constants/payment.constant';
import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SharedPaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async cancelPaymentAndOrders(paymentId: number) {
    // 1. lấy payment theo paymentId
    const payment = await this.prismaService.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        orders: {
          include: {
            // (ProductSkuSnapshots[])
            items: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const { orders } = payment;
    const productSkuSnapshots = orders.flatMap((order) => order.items);

    // 2. tạo transaction để update Payment Status + Order Status + Stock items sku của order
    await this.prismaService.$transaction(async (tx) => {
      // 2.1. update Payment Status
      const updatedPaymentStatusPromise = tx.payment.update({
        where: { id: paymentId, status: EnumPaymentStatus.PENDING },
        data: { status: EnumPaymentStatus.FAILED },
      });

      // 2.2. update Order Status
      const updatedOrderStatusPromise = tx.order.updateMany({
        where: {
          id: { in: orders.map((order) => order.id) },
          status: EnumOrderStatus.PENDING_PAYMENT,
          deletedAt: null,
        },
        data: { status: EnumOrderStatus.CANCELLED },
      });

      // 2.3. update Stock items sku của order
      const updatedStockItemsSkuPromises = Promise.all(
        productSkuSnapshots
          .filter((sku) => Boolean(sku.skuId)) // filter out skuId is null
          .map((sku) =>
            tx.sKU.update({
              where: {
                id: sku.skuId as number,
                deletedAt: null,
              },
              data: {
                stock: {
                  increment: sku.quantity, // Khôi phục stock của sku khi payment bị failed
                },
              },
            }),
          ),
      );

      await Promise.all([updatedPaymentStatusPromise, updatedOrderStatusPromise, updatedStockItemsSkuPromises]);
    });
  }
}
