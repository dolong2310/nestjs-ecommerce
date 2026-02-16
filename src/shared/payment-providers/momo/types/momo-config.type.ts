import { MomoLocale, RequestType } from '../enums';

export interface MomoConfig {
  partnerCode: string; // trường này thiết lập production trên momo doanh nghiệp
  accessKey: string; // trường này thiết lập production trên momo doanh nghiệp
  secretKey: string; // trường này thiết lập production trên momo doanh nghiệp

  storeId: string;
  storeName: string;
  requestType: RequestType;
  lang: MomoLocale;

  testMode?: boolean;
  enableLog?: boolean;
  loggerFn?: (data: unknown) => void;
  hostname?: string;
  port?: number;

  createPaymentEndpoint?: string;
  queryTransactionEndpoint?: string;
  refundTransactionEndpoint?: string;
}

export interface GlobalConfig extends MomoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  hostname: string;
  port: number;
  storeName: string;
  storeId: string;
  requestType: RequestType;
  lang: MomoLocale;
  createPaymentEndpoint: string;
  queryTransactionEndpoint: string;
  refundTransactionEndpoint: string;
}
