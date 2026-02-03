export const RoleName = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  SELLER: 'SELLER',
} as const;

export type RoleNameType = (typeof RoleName)[keyof typeof RoleName];
