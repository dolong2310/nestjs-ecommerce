import { LoggerData, LoggerOptions } from '../../common/types/logger.type';
import { MomoLocale } from '../enums';
import { ResultVerified } from './common.type';

export type QueryDr = {
  requestId: string;
  orderId: string;
};

export type BodyRequestQueryDr = QueryDr & {
  partnerCode: string;
  signature: string;
  lang: MomoLocale;
};

export type QueryDrResponseFromMomo = {
  requestId: string;
  orderId: string;
  extraData: string;
  amount: number;
  transId: number;
  payType: string;
  resultCode: number;
  refundTrans: string;
  message: string;
  responseTime: number;
  paymentOption: string;
  promotionInfo: {
    amount: number;
    amountSponsor: number;
    voucherId: string;
    voucherType: string;
    voucherName: string;
    merchantRate: string;
  };
};

export type QueryDrResponse = QueryDrResponseFromMomo & ResultVerified;

export type QueryDrResponseLogger = LoggerData<
  {
    createdAt: Date;
  } & QueryDrResponse
>;

export type QueryDrResponseOptions<Fields extends keyof QueryDrResponseLogger> = {
  withHash?: boolean;
} & LoggerOptions<QueryDrResponseLogger, Fields>;
