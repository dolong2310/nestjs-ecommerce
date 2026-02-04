import { PaymentSchema, PaymentTransactionSchema, WebhookPaymentBodySchema } from '@/routes/payment/payment.model';
import { createZodDto } from 'nestjs-zod';

export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}
export class PaymentTransactionDTO extends createZodDto(PaymentTransactionSchema) {}
export class PaymentDTO extends createZodDto(PaymentSchema) {}
