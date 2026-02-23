import { getResponseByStatusCode, verifySignature } from '../utils';
import { MomoResponseCode } from '../constants';
import {
  GlobalConfig,
  ReturnQueryFromMomo,
  VerifyIpnCall,
  VerifyIpnCallLogger,
  VerifyIpnCallOptions,
  VerifyReturnUrl,
  VerifyReturnUrlLogger,
  VerifyReturnUrlOptions,
} from '../types';
import { LoggerService } from '../../common/services/logger.service';
import { ignoreLogger } from '../../common/utils/logger.util';

export class VerificationService {
  private readonly config: GlobalConfig;
  private readonly logger: LoggerService;

  constructor(config: GlobalConfig, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  public verifyReturnUrl<LoggerFields extends keyof VerifyReturnUrlLogger>(
    query: ReturnQueryFromMomo,
    options?: VerifyReturnUrlOptions<LoggerFields>,
  ): VerifyReturnUrl {
    const { ...cloneQuery } = query;
    // Verify signature
    const isVerified = verifySignature({ ...query, accessKey: this.config.accessKey }, this.config.secretKey);

    let outputResults = {
      isVerified,
      isSuccess: cloneQuery.resultCode === MomoResponseCode.SUCCESS,
      message: getResponseByStatusCode(cloneQuery.resultCode, this.config.lang) || cloneQuery.message,
    };

    if (!isVerified) {
      outputResults = {
        ...outputResults,
        message: 'Wrong checksum',
      };
    }

    const result = {
      ...cloneQuery,
      ...outputResults,
    };

    const data2Log: VerifyReturnUrlLogger = {
      createdAt: new Date(),
      method: 'verifyReturnUrl',
      ...result,
    };

    this.logger.log(data2Log, options, 'verifyReturnUrl');

    return result;
  }

  public verifyIpnCall<LoggerFields extends keyof VerifyIpnCallLogger>(
    query: ReturnQueryFromMomo,
    options?: VerifyIpnCallOptions<LoggerFields>,
  ): VerifyIpnCall {
    const silentOptions = { logger: { loggerFn: ignoreLogger } };
    const result = this.verifyReturnUrl(query, silentOptions as VerifyReturnUrlOptions<keyof VerifyReturnUrlLogger>);

    const data2Log: VerifyIpnCallLogger = {
      createdAt: new Date(),
      method: 'verifyIpnCall',
      ...result,
      ...(options?.withHash ? { signature: query.signature } : {}),
    };

    this.logger.log(data2Log, options, 'verifyIpnCall');

    return result;
  }
}
