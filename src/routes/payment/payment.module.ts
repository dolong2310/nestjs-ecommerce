import { PaymentController } from '@/routes/payment/payment.controller';
import { PaymentProducer } from '@/routes/payment/payment.producer';
import { PaymentRepository } from '@/routes/payment/payment.repo';
import { PaymentService } from '@/routes/payment/payment.service';
import { PAYMENT_QUEUE_NAME } from '@/shared/constants/queue.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

const paymentQueueServices = [PaymentProducer];

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentRepository, PaymentService, ...paymentQueueServices],
})
export class PaymentModule {}
