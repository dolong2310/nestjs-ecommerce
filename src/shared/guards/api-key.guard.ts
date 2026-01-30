import envConfig from '@/shared/config';
import { extractApiKeyFromHeader } from '@/shared/helpers';
import { InvalidApiKeyException } from '@/shared/errors/shared-error.error';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const xApiKey = extractApiKeyFromHeader(request);

    if (!xApiKey || xApiKey !== envConfig.SECRET_API_KEY) {
      throw InvalidApiKeyException;
    }

    return true;
  }
}
