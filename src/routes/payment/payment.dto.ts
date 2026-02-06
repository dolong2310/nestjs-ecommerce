import { PaymentSchema, PaymentTransactionSchema, WebhookPaymentBodySchema } from '@/routes/payment/payment.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class WebhookPaymentBodyDTO extends createRequestDto(WebhookPaymentBodySchema) {}
export class PaymentTransactionDTO extends createResponseDto(PaymentTransactionSchema) {}
export class PaymentDTO extends createResponseDto(PaymentSchema) {}
