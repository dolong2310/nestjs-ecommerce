import { LoggerService } from '../../common/services/logger.service';
import { MomoResponseCode } from '../constants';
import { MomoLocale } from '../enums';
import {
  BodyRequestQueryDr,
  BodyRequestRefund,
  GlobalConfig,
  QueryDr,
  QueryDrResponse,
  QueryDrResponseFromMomo,
  QueryDrResponseLogger,
  QueryDrResponseOptions,
  Refund,
  RefundOptions,
  RefundResponse,
  RefundResponseFromMomo,
  RefundResponseLogger,
} from '../types';
import {
  buildQueryRawSignature,
  buildRefundRawSignature,
  generateOrderId,
  generateSignature,
  getResponseByStatusCode,
} from '../utils';

export class QueryService {
  private readonly config: GlobalConfig;
  private readonly logger: LoggerService;

  constructor(config: GlobalConfig, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  public async queryDr<LoggerFields extends keyof QueryDrResponseLogger>(
    query: QueryDr,
    options?: QueryDrResponseOptions<LoggerFields>,
  ): Promise<QueryDrResponse> {
    const { orderId, requestId = generateOrderId(this.config.partnerCode) } = query;

    // Build raw signature
    const rawSignature = buildQueryRawSignature({
      accessKey: this.config.accessKey,
      orderId,
      partnerCode: this.config.partnerCode,
      requestId,
    });

    // Generate signature
    const signature = generateSignature(this.config.secretKey, rawSignature);

    // Build request body
    const requestBody = JSON.stringify({
      partnerCode: this.config.partnerCode,
      requestId,
      orderId,
      lang: this.config.lang || MomoLocale.VI,
      signature,
    } as BodyRequestQueryDr);

    // Build full URL
    const port = this.config.port || 443;
    const url = `https://${this.config.hostname}:${port}${this.config.queryTransactionEndpoint}`;

    // Return promise to handle async fetch request
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      const data = (await response.json()) as QueryDrResponseFromMomo;

      let outputResults = {
        isVerified: true,
        isSuccess: data.resultCode === MomoResponseCode.SUCCESS,
        ...data,
        // message: getResponseByStatusCode(data.resultCode, this.config.locale),
      };

      const data2Log: QueryDrResponseLogger = {
        createdAt: new Date(),
        method: 'queryDr',
        ...outputResults,
      };

      this.logger.log(data2Log, options, 'queryDr');

      return outputResults;
    } catch (error) {
      throw error;
    }
  }

  public async refund<LoggerFields extends keyof RefundResponseLogger>(
    data: Refund,
    options?: RefundOptions<LoggerFields>,
  ): Promise<RefundResponse> {
    const { orderId, amount, transId, description = '', requestId = generateOrderId(this.config.partnerCode) } = data;

    // Build raw signature
    const rawSignature = buildRefundRawSignature({
      accessKey: this.config.accessKey,
      amount,
      description,
      orderId,
      partnerCode: this.config.partnerCode,
      requestId,
      transId,
    });

    // Generate signature
    const signature = generateSignature(this.config.secretKey, rawSignature);

    // Build request body
    const requestBody = JSON.stringify({
      partnerCode: this.config.partnerCode,
      requestId,
      orderId,
      amount,
      transId,
      lang: this.config.lang || MomoLocale.VI,
      description,
      signature,
    } as BodyRequestRefund);

    // Build full URL
    const port = this.config.port || 443;
    const url = `https://${this.config.hostname}:${port}${this.config.refundTransactionEndpoint}`;

    // Return promise to handle async fetch request
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      const data = (await response.json()) as RefundResponseFromMomo;

      let outputResults = {
        isVerified: true,
        isSuccess: data.resultCode === MomoResponseCode.SUCCESS,
        ...data,
        message: getResponseByStatusCode(data.resultCode, this.config.lang),
      };

      const data2Log: RefundResponseLogger = {
        createdAt: new Date(),
        method: 'refund',
        ...outputResults,
      };

      this.logger.log(data2Log, options, 'refund');

      return outputResults;
    } catch (error) {
      throw error;
    }
  }
}
