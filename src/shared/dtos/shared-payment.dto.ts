import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export class ReturnQueryFromVNPayDTO extends createZodDto(
  z.object({
    vnp_Amount: z.string(),
    vnp_BankCode: z.string(),
    vnp_BankTranNo: z.string(),
    vnp_CardType: z.string(),
    vnp_OrderInfo: z.string(),
    vnp_PayDate: z.string(),
    vnp_ResponseCode: z.string(),
    vnp_TmnCode: z.string(),
    vnp_TransactionNo: z.string(),
    vnp_TransactionStatus: z.string(),
    vnp_TxnRef: z.string(),
    vnp_SecureHash: z.string(),
  }),
) {}

export class ReturnQueryFromMomoDTO extends createZodDto(
  z.object({
    orderType: z.string(),
    amount: z.coerce.number(),
    partnerCode: z.string(),
    orderId: z.string(),
    extraData: z.string(),
    signature: z.string(),
    transId: z.coerce.number(),
    responseTime: z.coerce.number(),
    resultCode: z.coerce.number(), // z.enum(Momo.MomoResponseCode),
    message: z.string(),
    payType: z.string(),
    requestId: z.string(),
    orderInfo: z.string(),
  }),
) {}
