import { Momo } from '../momo';
import { VNPay } from '../vnpay';
import { EnumPaymentMethod, PaymentMethod } from './constants';
import {
  BuildPaymentUrlInputMap,
  BuildPaymentUrlOptionsMap,
  IPaymentProvider,
  PaymentConfigMap,
  QueryDrInputMap,
  QueryDrOptionsMap,
  QueryDrResultMap,
  RefundInputMap,
  RefundOptionsMap,
  RefundResultMap,
  VerifyIpnCallInputMap,
  VerifyIpnCallOptionsMap,
  VerifyIpnCallResultMap,
  VerifyReturnUrlInputMap,
  VerifyReturnUrlOptionsMap,
  VerifyReturnUrlResultMap,
} from './types';

const PROVIDER_FACTORIES = {
  [EnumPaymentMethod.VNPAY]: (config: PaymentConfigMap[typeof EnumPaymentMethod.VNPAY]) => new VNPay(config),
  [EnumPaymentMethod.MOMO]: (config: PaymentConfigMap[typeof EnumPaymentMethod.MOMO]) => new Momo(config),
};

export class PaymentFactory<T extends PaymentMethod = PaymentMethod> {
  private paymentProvider: IPaymentProvider<T>;

  constructor(type: T, config: PaymentConfigMap[T]) {
    this.paymentProvider = this.getProvider(type, config);
  }

  private getProvider(type: T, config: PaymentConfigMap[T]): IPaymentProvider<T> {
    const factory = PROVIDER_FACTORIES[type] as unknown as (config: PaymentConfigMap[T]) => IPaymentProvider<T>;
    return factory(config);
  }

  buildPaymentUrl(data: BuildPaymentUrlInputMap[T], options?: BuildPaymentUrlOptionsMap[T]): Promise<string> {
    return this.paymentProvider.buildPaymentUrl(data, options);
  }

  verifyReturnUrl(
    query: VerifyReturnUrlInputMap[T],
    options?: VerifyReturnUrlOptionsMap[T],
  ): VerifyReturnUrlResultMap[T] {
    return this.paymentProvider.verifyReturnUrl(query, options);
  }

  verifyIpnCall(query: VerifyIpnCallInputMap[T], options?: VerifyIpnCallOptionsMap[T]): VerifyIpnCallResultMap[T] {
    return this.paymentProvider.verifyIpnCall(query, options);
  }

  queryDr(query: QueryDrInputMap[T], options?: QueryDrOptionsMap[T]): QueryDrResultMap[T] {
    return this.paymentProvider.queryDr(query, options);
  }

  refund(data: RefundInputMap[T], options?: RefundOptionsMap[T]): RefundResultMap[T] {
    return this.paymentProvider.refund(data, options);
  }
}

export default PaymentFactory;
