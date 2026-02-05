import { PaymentConsumer } from '@/queues/payment.consumer';
import { OrderController } from '@/routes/order/order.controller';
import { OrderProducer } from '@/routes/order/order.producer';
import { OrderRepository } from '@/routes/order/order.repo';
import { OrderService } from '@/routes/order/order.service';
import { PAYMENT_QUEUE_NAME } from '@/shared/constants/queue.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

const paymentQueueServices = [OrderProducer, PaymentConsumer];

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [OrderController],
  providers: [OrderRepository, OrderService, ...paymentQueueServices],
})
export class OrderModule {}
