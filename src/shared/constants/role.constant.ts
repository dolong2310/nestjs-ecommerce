export const RoleName = {
  Admin: "ADMIN",
  User: "USER",
  Seller: "SELLER",
} as const;

export type RoleNameType = (typeof RoleName)[keyof typeof RoleName];
