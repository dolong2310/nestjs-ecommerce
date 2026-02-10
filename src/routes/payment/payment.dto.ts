import { PaymentTransactionSchema, WebhookPaymentBodySchema } from '@/routes/payment/payment.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';
import { PaymentSchema } from '@/shared/models/shared-payment.model';

export class WebhookPaymentBodyDTO extends createRequestDto(WebhookPaymentBodySchema) {}
export class PaymentTransactionDTO extends createResponseDto(PaymentTransactionSchema) {}
export class PaymentDTO extends createResponseDto(PaymentSchema) {}
