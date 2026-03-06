import envConfig from '@/shared/config';
import { InvalidPaymentApiKeyException } from '@/shared/errors/shared-error.error';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

// import { extractApiKeyFromHeader } from '@/shared/helpers';

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // const paymentApiKey = extractApiKeyFromHeader(request, 'payment-api-key');

    // NOTE: Sepay sẽ gắn apikey ở header authorization: Apikey <apikey>
    const [type, paymentApiKey] = request.headers.authorization?.split(' ') ?? [];

    if (!paymentApiKey || type !== 'Apikey' || paymentApiKey !== envConfig.SECRET_PAYMENT_API_KEY) {
      throw InvalidPaymentApiKeyException;
    }

    return true;
  }
}
