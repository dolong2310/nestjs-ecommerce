import { GlobalConfig } from './momo-config.type';

export type DefaultConfig = Pick<GlobalConfig, 'partnerCode' | 'storeName' | 'storeId' | 'requestType' | 'lang'>;

export type ResultVerified = {
  isSuccess: boolean;
  isVerified: boolean;
  message: string;
};
