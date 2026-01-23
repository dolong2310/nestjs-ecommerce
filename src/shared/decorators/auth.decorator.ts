import { AuthKey } from '@/shared/constants/auth.constant';
// import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { AUTH_TYPE_KEY, AuthMetadata, AuthOptions, AuthType } from '@/shared/types/shared-auth.type';
import { applyDecorators, SetMetadata } from '@nestjs/common';

// auth decorator -> auth required
// Example: @Private([AuthKey.JWT, AuthKey.API_KEY], { condition: AuthConditionKey.AND })
export function Private(
  types: AuthType[],
  options?: AuthOptions,
) {
  const metadata: AuthMetadata = {
    types,
    options: {
      condition: options?.condition,
    },
  };

  return applyDecorators(
    SetMetadata(AUTH_TYPE_KEY, metadata),
    // UseGuards(AuthCompositeGuard),
  );
}

// public decorator -> no auth required
// Example: @Public() | @Private([AuthKey.NONE]) | @Private([])
export function Public() {
  return Private([AuthKey.NONE])
}
