import { PaymentController } from '@/routes/payment/payment.controller';
import { PaymentRepository } from '@/routes/payment/payment.repo';
import { PaymentService } from '@/routes/payment/payment.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [PaymentController],
  providers: [PaymentRepository, PaymentService],
})
export class PaymentModule {}
