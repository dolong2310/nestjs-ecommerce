import type { LoggerData, LoggerOptions } from '../../common/types/logger.type';
import { MomoLocale } from '../enums';
import { ResultVerified } from './common.type';

export type Refund = {
  orderId: string;
  amount: number;
  transId: number;
  description: string;
  requestId: string;
};

export type BodyRequestRefund = {
  partnerCode: string;
  lang: MomoLocale;
  signature: string;
};

export type RefundResponseFromMomo = {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  transId: number;
  resultCode: number;
  message: string;
  responseTime: number;
};

export type RefundResponse = ResultVerified & RefundResponseFromMomo;

export type RefundResponseLogger = LoggerData<
  {
    createdAt: Date;
  } & RefundResponse
>;

export type RefundOptions<Fields extends keyof RefundResponseLogger> = LoggerOptions<RefundResponseLogger, Fields>;
