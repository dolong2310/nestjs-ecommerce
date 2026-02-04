import { PaymentRepository } from '@/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from '@/routes/payment/payment.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async receiver(props: { body: WebhookPaymentBodyType }): Promise<MessageResponseType> {
    try {
      return this.paymentRepository.receiver(props);
    } catch (error) {
      throw error;
    }
  }
}
