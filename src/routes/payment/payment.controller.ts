import { WebhookPaymentBodyDTO } from '@/routes/payment/payment.dto';
import { PaymentService } from '@/routes/payment/payment.service';
import { AuthKey } from '@/shared/constants/auth.constant';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { Private, Public } from '@/shared/decorators/auth.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { ReturnQueryFromMomoDTO, ReturnQueryFromVNPayDTO } from '@/shared/dtos/shared-payment.dto';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'payment', version: CURRENT_VERSION })
@ApiSecurity('payment-api-key')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('receiver')
  @ZodResponse({ type: MessageResponseDTO })
  @Private([AuthKey.PAYMENT_API_KEY])
  receiver(@Body() body: WebhookPaymentBodyDTO): Promise<MessageResponseDTO> {
    return this.paymentService.receiver({ body });
  }

  /**
   * This is the POST request that MoMo will call when the payment process is done to notify the result of the payment for merchant server.
   * According to MoMo documentation:
   * - Partner must respond with HTTP 204 (No Content)
   * - Must respond within 15 seconds
   * - Must verify signature, partnerCode, orderId, and amount
   * - resultCode = 0 or 9000: transaction success
   * - resultCode <> 0 and <> 9000: transaction failed
   */
  @Post('momo-ipn')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  momoIpn(@Body() body: ReturnQueryFromMomoDTO): Promise<void> {
    return this.paymentService.verifyIpnMomo(body);
  }

  @Get('momo-return')
  @Public()
  momoReturn(@Query() query: ReturnQueryFromMomoDTO): MessageResponseDTO {
    return this.paymentService.verifyReturnMomo(query);
  }

  /**
   * This is the get request that VNPay will call this when the payment process is done to notify the result of the payment for merchant server,
   * So you need to implement this endpoint to handle the result of the payment
   * Eg: Update the order status, send the email to the customer, etc.
   */
  @Get('vnpay-ipn')
  @Public()
  vnpayIpn(@Query() query: ReturnQueryFromVNPayDTO) {
    return this.paymentService.verifyIpnVNPay(query);
  }

  /**
   * WARNING: Do not use this endpoint to handle the result of the payment, this should be used to handle redirect user from VNPay to your website
   * After the payment process is done, VNPay will redirect use page to the return url that you provided in the payment url
   */
  @Get('vnpay-return')
  @Public()
  vnpayReturn(@Query() query: ReturnQueryFromVNPayDTO): MessageResponseDTO {
    return this.paymentService.verifyReturnVNPay(query);
  }
}
