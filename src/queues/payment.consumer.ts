import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from '@/shared/constants/queue.constant';
import { SharedPaymentRepository } from '@/shared/repositories/shared-payment.repo';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(PAYMENT_QUEUE_NAME)
export class PaymentConsumer extends WorkerHost {
  constructor(private readonly sharedPaymentRepository: SharedPaymentRepository) {
    super();
  }

  async process(job: Job<{ paymentId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCEL_PAYMENT_JOB_NAME: {
        const { paymentId } = job.data;
        await this.sharedPaymentRepository.cancelPaymentAndOrders(paymentId);
        return {};
      }
      default: {
        break;
      }
    }
  }
}
