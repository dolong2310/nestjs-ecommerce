import { PaymentSchema, PaymentTransactionSchema, WebhookPaymentBodySchema } from '@/routes/payment/payment.model';
import z from 'zod';

export type WebhookPaymentBodyType = z.infer<typeof WebhookPaymentBodySchema>;
export type PaymentTransactionType = z.infer<typeof PaymentTransactionSchema>;
export type PaymentType = z.infer<typeof PaymentSchema>;
