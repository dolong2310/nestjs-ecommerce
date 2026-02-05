import { PAYMENT_QUEUE_NAME } from '@/shared/constants/queue.constant';
import { generateCancelPaymentJobId } from '@/shared/helpers';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class PaymentProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private readonly paymentQueue: Queue) {}

  async removeJob(paymentId: number) {
    await this.paymentQueue.remove(generateCancelPaymentJobId(paymentId));
  }
}
