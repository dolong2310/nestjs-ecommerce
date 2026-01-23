import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { AUTH_TYPE_KEY, AuthMetadata, AuthOptions, AuthType } from '@/shared/types/shared-auth.type';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

export function Auth(
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
    UseGuards(AuthCompositeGuard),
  );
}
