import type { RoleNameType } from '@/shared/constants/role.constant';

// Access Token
export interface AccessTokenPayloadCreate {
  userId: number;
  deviceId: number;
  roleId: number;
  roleName: RoleNameType;
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number;
  iat: number;
}

// Refresh Token
export interface RefreshTokenPayloadCreate {
  userId: number;
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number;
  iat: number;
}
