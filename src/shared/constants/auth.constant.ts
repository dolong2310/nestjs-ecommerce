export const REQUEST_USER_KEY = 'user';

export const AuthKey = {
  JWT: 'jwt',
  API_KEY: 'apiKey',
  NONE: 'none',
} as const;

export const AuthConditionKey = {
  AND: 'and',
  OR: 'or',
} as const;

export const EnumUserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const;

export const EnumOtpCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export type EnumOtpCodeType = (typeof EnumOtpCode)[keyof typeof EnumOtpCode];
