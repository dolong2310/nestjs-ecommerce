import { WebhookPaymentBodyDTO } from '@/routes/payment/payment.dto';
import { PaymentService } from '@/routes/payment/payment.service';
import { AuthKey } from '@/shared/constants/auth.constant';
import { Private } from '@/shared/decorators/auth.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('receiver')
  @ZodSerializerDto(MessageResponseDTO)
  @Private([AuthKey.PAYMENT_API_KEY])
  receiver(@Body() body: WebhookPaymentBodyDTO): Promise<MessageResponseDTO> {
    return this.paymentService.receiver({ body });
  }
}
