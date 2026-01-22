export const REQUEST_USER_KEY = 'user';

export const AuthKey = {
  JWT: 'jwt',
  API_KEY: 'apiKey',
} as const;

export const AuthConditionKey = {
  AND: 'and',
  OR: 'or',
} as const;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const;