import { LoggerService } from '../../common/services/logger.service';
import {
  BuildPaymentUrl,
  BuildPaymentUrlLogger,
  BuildPaymentUrlOptions,
  BuildPaymentUrlResponse,
  DefaultConfig,
  GlobalConfig,
} from '../types';
import { buildPaymentRawSignature, generateOrderId, generateSignature } from '../utils';

export class PaymentService {
  private readonly config: GlobalConfig;
  private readonly defaultConfig: DefaultConfig;
  private readonly logger: LoggerService;

  constructor(config: GlobalConfig, logger: LoggerService) {
    this.config = config;
    this.logger = logger;

    this.defaultConfig = {
      partnerCode: config.partnerCode,
      storeName: config.storeName || 'Test',
      storeId: config.storeId || 'MomoTestStore',
      requestType: config.requestType,
      lang: config.lang,
    };
  }

  async buildPaymentUrl<LoggerFields extends keyof BuildPaymentUrlLogger>(
    data: BuildPaymentUrl,
    options?: BuildPaymentUrlOptions<LoggerFields>,
  ): Promise<string> {
    const {
      amount,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData = '',
      requestType = this.defaultConfig.requestType,
      orderId = generateOrderId(this.config.partnerCode),
      requestId = orderId,
    } = data;

    const dataToBuild = {
      ...this.defaultConfig,
      ...data,
    };

    // Build raw signature
    const rawSignature = buildPaymentRawSignature({
      accessKey: this.config.accessKey,
      amount,
      extraData,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode: this.config.partnerCode,
      redirectUrl,
      requestId,
      requestType,
    });

    // Generate signature
    const signature = generateSignature(this.config.secretKey, rawSignature);

    // Build request body
    const requestBody = JSON.stringify({ ...dataToBuild, signature });

    // Build full URL
    const url = `https://${this.config.hostname}${this.config.createPaymentEndpoint}`;
    // const port = this.config.port || 443;
    // const url = `https://${this.config.hostname}:${port}${this.config.createPaymentEndpoint}`;

    // Return promise to handle async fetch request
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      const data = (await response.json()) as BuildPaymentUrlResponse;

      const data2Log: BuildPaymentUrlLogger = {
        createdAt: new Date(),
        method: 'buildPaymentUrl',
        paymentUrl:
          options?.withHash && redirectUrl
            ? redirectUrl.toString()
            : (() => {
                if (!redirectUrl) return '';
                const cloneUrl = new URL(redirectUrl.toString());
                cloneUrl.searchParams.delete('vnp_SecureHash');
                return cloneUrl.toString();
              })(),
        ...dataToBuild,
      };

      this.logger.log(data2Log, options, 'buildPaymentUrl');

      return data.payUrl;
    } catch (error) {
      throw error;
    }
  }
}
