import envConfig from '@/shared/config';
import { InvalidPaymentApiKeyException } from '@/shared/errors/shared-error.error';
import { extractApiKeyFromHeader } from '@/shared/helpers';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const paymentApiKey = extractApiKeyFromHeader(request, 'payment-api-key');

    if (!paymentApiKey || paymentApiKey !== envConfig.SECRET_PAYMENT_API_KEY) {
      throw InvalidPaymentApiKeyException;
    }

    return true;
  }
}
