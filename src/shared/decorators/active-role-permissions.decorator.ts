import { REQUEST_ROLE_PERMISSIONS_KEY } from '@/shared/constants/auth.constant';
import { RoleWithPermissionsType } from '@/shared/types/shared-role.type';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveRolePermissions = createParamDecorator<keyof RoleWithPermissionsType | undefined>(
  (payloadKey, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const rolePermissions = request[REQUEST_ROLE_PERMISSIONS_KEY] as RoleWithPermissionsType;

    return payloadKey ? rolePermissions?.[payloadKey] : rolePermissions;
  },
);
