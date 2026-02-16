import { LoggerData, LoggerOptions } from '../../common/types/logger.type';
import { ReturnQueryFromMomo } from './return-from-momo.type';

export type VerifyReturnUrl = {
  isSuccess: boolean;
  isVerified: boolean;
  message: string;
} & ReturnQueryFromMomo;

export type VerifyReturnUrlLogger = LoggerData<
  {
    createdAt: Date;
  } & VerifyReturnUrl
>;

export type VerifyReturnUrlOptions<Fields extends keyof VerifyReturnUrlLogger> = {
  withHash?: boolean;
} & LoggerOptions<VerifyReturnUrlLogger, Fields>;
