import envConfig from '@/shared/config';
import { InvalidApiKeyException } from '@/shared/errors/shared-error.error';
import { extractApiKeyFromHeader } from '@/shared/helpers';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const xApiKey = extractApiKeyFromHeader(request);

    if (!xApiKey || xApiKey !== envConfig.SECRET_API_KEY) {
      throw InvalidApiKeyException;
    }

    return true;
  }
}
