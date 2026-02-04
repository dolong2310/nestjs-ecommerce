import { EnumPaymentStatus } from '@/shared/constants/payment.constant';
import z from 'zod';

export const PaymentTransactionSchema = z.object({
  id: z.number(),
  gateway: z.string().max(100),
  transactionDate: z.coerce.date().default(new Date()),
  accountNumber: z.string().max(100).nullable(),
  subAccount: z.string().max(250).nullable(),
  amountIn: z.number().default(0),
  amountOut: z.number().default(0),
  accumulated: z.number().default(0),
  code: z.string().max(250).nullable(),
  transactionContent: z.string().nullable(),
  referenceNumber: z.string().max(255).nullable(),
  body: z.string().nullable(),

  createdAt: z.date().default(new Date()),
});

/**
 * Tài liệu tham khảo: https://docs.sepay.vn/tich-hop-webhooks.html
 * body sample:
 * {
      "id": 92704,                              // ID giao dịch trên SePay
      "gateway":"Vietcombank",                  // Brand name của ngân hàng
      "transactionDate":"2023-03-25 14:02:37",  // Thời gian xảy ra giao dịch phía ngân hàng
      "accountNumber":"0123499999",              // Số tài khoản ngân hàng
      "code":null,                               // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)
      "content":"chuyen tien mua iphone",        // Nội dung chuyển khoản
      "transferType":"in",                       // Loại giao dịch. in là tiền vào, out là tiền ra
      "transferAmount":2277000,                  // Số tiền giao dịch
      "accumulated":19077000,                    // Số dư tài khoản (lũy kế)
      "subAccount":null,                         // Tài khoản ngân hàng phụ (tài khoản định danh),
      "referenceCode":"MBVCB.3278907687",         // Mã tham chiếu của tin nhắn sms
      "description":""                           // Toàn bộ nội dung tin nhắn sms
    }
 */
export const WebhookPaymentBodySchema = z.object({
  id: z.number(), // ID giao dịch trên SePay
  gateway: z.string(), // Brand name của ngân hàng
  transactionDate: z.string(), // Thời gian xảy ra giao dịch phía ngân hàng
  accountNumber: z.string().nullable(), // Số tài khoản ngân hàng
  code: z.string().nullable(), // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)
  content: z.string().nullable(), // Nội dung chuyển khoản
  transferType: z.enum(['in', 'out']), // Loại giao dịch. in là tiền vào, out là tiền ra
  transferAmount: z.number(), // Số tiền giao dịch
  accumulated: z.number(), // Số dư tài khoản (lũy kế)
  subAccount: z.string().nullable(), // Tài khoản ngân hàng phụ (tài khoản định danh),
  referenceCode: z.string().nullable(), // Mã tham chiếu của tin nhắn sms
  description: z.string(), // Toàn bộ nội dung tin nhắn sms
});

export const PaymentSchema = z.object({
  id: z.number(),
  status: z.enum(EnumPaymentStatus),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});
