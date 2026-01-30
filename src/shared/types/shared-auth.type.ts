import { AuthConditionKey, AuthKey } from '@/shared/constants/auth.constant';

export const AUTH_TYPE_KEY = 'authType';

export type AuthType = (typeof AuthKey)[keyof typeof AuthKey];

export type AuthCondition = (typeof AuthConditionKey)[keyof typeof AuthConditionKey];

export interface AuthOptions {
  condition?: AuthCondition;
}

export interface AuthMetadata {
  types: AuthType[];
  options: AuthOptions;
}
