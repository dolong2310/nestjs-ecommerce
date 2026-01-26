import { REQUEST_USER_KEY } from '@/shared/constants/auth.constant';
import { AccessTokenPayload } from '@/shared/types/jwt.type';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveUser = createParamDecorator<keyof AccessTokenPayload | undefined>(
  (payloadKey, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY] as AccessTokenPayload;

    return payloadKey ? user?.[payloadKey] : user;
  },
);
