
import envConfig from '@/shared/config';
import { extractApiKeyFromHeader } from '@/shared/helpers';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const xApiKey = extractApiKeyFromHeader(request);

    if (!xApiKey || xApiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException([{
        field: 'xApiKey',
        message: 'Invalid API key',
      }]);
    }

    return true;
  }
}
