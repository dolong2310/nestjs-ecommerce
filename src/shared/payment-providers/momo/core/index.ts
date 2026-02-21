import { LoggerService } from '../../common/services/logger.service';
import { resolveUrlString } from '../../common/utils/http.util';
import {
  CREATE_PAYMENT_ENDPOINT,
  GET_BANK_LIST_ENDPOINT,
  MOMO_GATEWAY_PRODUCTION_HOST,
  MOMO_GATEWAY_SANDBOX_HOST,
  MOMO_PARTNER_CODE,
  QUERY_TRANSACTION_ENDPOINT,
  REFUND_TRANSACTION_ENDPOINT,
} from '../constants';
import { RequestType } from '../enums';
import {
  BankList,
  BuildPaymentUrl,
  BuildPaymentUrlLogger,
  BuildPaymentUrlOptions,
  GlobalConfig,
  MomoConfig,
  QueryDr,
  QueryDrResponse,
  QueryDrResponseLogger,
  QueryDrResponseOptions,
  Refund,
  RefundOptions,
  RefundResponse,
  RefundResponseLogger,
  ReturnQueryFromMomo,
  VerifyIpnCall,
  VerifyIpnCallLogger,
  VerifyIpnCallOptions,
  VerifyReturnUrl,
  VerifyReturnUrlLogger,
  VerifyReturnUrlOptions,
} from '../types';
import { PaymentService } from './momo-payment.service';
import { QueryService } from './momo-query.service';
import { VerificationService } from './momo-verification.service';

export class Momo {
  private readonly globalConfig: GlobalConfig;

  // Service instances
  private readonly loggerService: LoggerService;
  private readonly paymentService: PaymentService;
  private readonly verificationService: VerificationService;
  private readonly queryService: QueryService;

  constructor({
    partnerCode = MOMO_PARTNER_CODE,
    accessKey,
    secretKey,
    testMode = false,
    storeName = 'Test',
    storeId = 'MomoTestStore',
    requestType = RequestType.PAY_WITH_METHOD,
    enableLog = false,
    loggerFn,
    ...config
  }: MomoConfig) {
    // Determine hostname based on test mode
    const hostname = testMode
      ? MOMO_GATEWAY_SANDBOX_HOST.replace('https://', '')
      : MOMO_GATEWAY_PRODUCTION_HOST.replace('https://', '');

    this.globalConfig = {
      partnerCode,
      accessKey,
      secretKey,
      hostname,
      storeName,
      storeId,
      requestType,
      createPaymentEndpoint: CREATE_PAYMENT_ENDPOINT,
      queryTransactionEndpoint: QUERY_TRANSACTION_ENDPOINT,
      refundTransactionEndpoint: REFUND_TRANSACTION_ENDPOINT,
      ...config,
    };

    // Initialize services
    this.loggerService = new LoggerService(enableLog, loggerFn);

    this.paymentService = new PaymentService(this.globalConfig, this.loggerService);

    this.verificationService = new VerificationService(this.globalConfig, this.loggerService);

    this.queryService = new QueryService(this.globalConfig, this.loggerService);
  }

  public async getBankList(): Promise<BankList> {
    const url = resolveUrlString(
      this.globalConfig.testMode ? MOMO_GATEWAY_SANDBOX_HOST : MOMO_GATEWAY_PRODUCTION_HOST,
      GET_BANK_LIST_ENDPOINT,
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bank list: HTTP ${response.status}`);
    }

    const bankList = (await response.json()) as BankList;

    return bankList;
  }

  public buildPaymentUrl<LoggerFields extends keyof BuildPaymentUrlLogger>(
    data: BuildPaymentUrl,
    options?: BuildPaymentUrlOptions<LoggerFields>,
  ): Promise<string> {
    return this.paymentService.buildPaymentUrl(data, options);
  }

  public verifyReturnUrl<LoggerFields extends keyof VerifyReturnUrlLogger>(
    query: ReturnQueryFromMomo,
    options?: VerifyReturnUrlOptions<LoggerFields>,
  ): VerifyReturnUrl {
    return this.verificationService.verifyReturnUrl(query, options);
  }

  public verifyIpnCall<LoggerFields extends keyof VerifyIpnCallLogger>(
    query: ReturnQueryFromMomo,
    options?: VerifyIpnCallOptions<LoggerFields>,
  ): VerifyIpnCall {
    return this.verificationService.verifyIpnCall(query, options);
  }

  public async queryDr<LoggerFields extends keyof QueryDrResponseLogger>(
    query: QueryDr,
    options?: QueryDrResponseOptions<LoggerFields>,
  ): Promise<QueryDrResponse> {
    return this.queryService.queryDr(query, options);
  }

  public async refund<LoggerFields extends keyof RefundResponseLogger>(
    data: Refund,
    options?: RefundOptions<LoggerFields>,
  ): Promise<RefundResponse> {
    return this.queryService.refund(data, options);
  }
}
