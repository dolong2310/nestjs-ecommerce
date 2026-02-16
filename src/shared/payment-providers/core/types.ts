import type * as MomoTypes from '../momo/types';
import type * as VNPayTypes from '../vnpay/types';
import { EnumPaymentMethod, type PaymentMethod } from './constants';

// ─── Interface ────────────────────────────────────────────────────────────────
export interface IPaymentProvider<T extends PaymentMethod> {
  buildPaymentUrl(data: BuildPaymentUrlInputMap[T], options?: BuildPaymentUrlOptionsMap[T]): Promise<string>;
  verifyReturnUrl(
    query: VerifyReturnUrlInputMap[T],
    options?: VerifyReturnUrlOptionsMap[T],
  ): VerifyReturnUrlResultMap[T];
  verifyIpnCall(query: VerifyIpnCallInputMap[T], options?: VerifyIpnCallOptionsMap[T]): VerifyIpnCallResultMap[T];
  queryDr(query: QueryDrInputMap[T], options?: QueryDrOptionsMap[T]): QueryDrResultMap[T];
  refund(data: RefundInputMap[T], options?: RefundOptionsMap[T]): RefundResultMap[T];
}

// ─── Provider Registry (Single Source of Truth) ───────────────────────────────
export interface PaymentProviderRegistry {
  [EnumPaymentMethod.MOMO]: {
    Config: MomoTypes.MomoConfig;
    BuildPaymentUrlInput: MomoTypes.BuildPaymentUrl;
    BuildPaymentUrlOptions: MomoTypes.BuildPaymentUrlOptions<keyof MomoTypes.BuildPaymentUrlLogger>;
    VerifyReturnUrlInput: MomoTypes.ReturnQueryFromMomo;
    VerifyReturnUrlResult: MomoTypes.VerifyReturnUrl;
    VerifyReturnUrlOptions: MomoTypes.VerifyReturnUrlOptions<keyof MomoTypes.VerifyReturnUrlLogger>;
    VerifyIpnCallInput: MomoTypes.ReturnQueryFromMomo;
    VerifyIpnCallResult: MomoTypes.VerifyIpnCall;
    VerifyIpnCallOptions: MomoTypes.VerifyIpnCallOptions<keyof MomoTypes.VerifyIpnCallLogger>;
    QueryDrInput: MomoTypes.QueryDr;
    QueryDrResult: MomoTypes.QueryDrResponse;
    QueryDrOptions: MomoTypes.QueryDrResponseOptions<keyof MomoTypes.QueryDrResponseLogger>;
    RefundInput: MomoTypes.Refund;
    RefundResult: MomoTypes.RefundResponse;
    RefundOptions: MomoTypes.RefundOptions<keyof MomoTypes.RefundResponseLogger>;
  };
  [EnumPaymentMethod.VNPAY]: {
    Config: VNPayTypes.VNPayConfig;
    BuildPaymentUrlInput: VNPayTypes.BuildPaymentUrl;
    BuildPaymentUrlOptions: VNPayTypes.BuildPaymentUrlOptions<keyof VNPayTypes.BuildPaymentUrlLogger>;
    VerifyReturnUrlInput: VNPayTypes.ReturnQueryFromVNPay;
    VerifyReturnUrlResult: VNPayTypes.VerifyReturnUrl;
    VerifyReturnUrlOptions: VNPayTypes.VerifyReturnUrlOptions<keyof VNPayTypes.VerifyReturnUrlLogger>;
    VerifyIpnCallInput: VNPayTypes.ReturnQueryFromVNPay;
    VerifyIpnCallResult: VNPayTypes.VerifyIpnCall;
    VerifyIpnCallOptions: VNPayTypes.VerifyIpnCallOptions<keyof VNPayTypes.VerifyIpnCallLogger>;
    QueryDrInput: VNPayTypes.QueryDr;
    QueryDrResult: VNPayTypes.QueryDrResponse;
    QueryDrOptions: VNPayTypes.QueryDrResponseOptions<keyof VNPayTypes.QueryDrResponseLogger>;
    RefundInput: VNPayTypes.Refund;
    RefundResult: VNPayTypes.RefundResponse;
    RefundOptions: VNPayTypes.RefundOptions<keyof VNPayTypes.RefundResponseLogger>;
  };
}

// ─── Provider Shape Contract ──────────────────────────────────────────────────
/**
 * Defines the required type slots that every payment provider must fill.
 * If a new provider is missing any slot, the compile-time validation below
 * will immediately produce an error.
 */
export interface PaymentProviderShape {
  Config: object;
  BuildPaymentUrlInput: object;
  BuildPaymentUrlOptions: object;
  VerifyReturnUrlInput: object;
  VerifyReturnUrlResult: object;
  VerifyReturnUrlOptions: object;
  VerifyIpnCallInput: object;
  VerifyIpnCallResult: object;
  VerifyIpnCallOptions: object;
  QueryDrInput: object;
  QueryDrResult: object;
  QueryDrOptions: object;
  RefundInput: object;
  RefundResult: object;
  RefundOptions: object;
}

// ─── Helper: Extract a single slot from all providers ─────────────────────────
type ExtractFromRegistry<Slot extends keyof PaymentProviderShape> = {
  [K in PaymentMethod]: PaymentProviderRegistry[K][Slot];
};

// ─── Derived Type Maps (auto-generated from registry) ─────────────────────────
export type PaymentConfigMap = ExtractFromRegistry<'Config'>;
export type BuildPaymentUrlInputMap = ExtractFromRegistry<'BuildPaymentUrlInput'>;
export type BuildPaymentUrlOptionsMap = ExtractFromRegistry<'BuildPaymentUrlOptions'>;
export type VerifyReturnUrlInputMap = ExtractFromRegistry<'VerifyReturnUrlInput'>;
export type VerifyReturnUrlResultMap = ExtractFromRegistry<'VerifyReturnUrlResult'>;
export type VerifyReturnUrlOptionsMap = ExtractFromRegistry<'VerifyReturnUrlOptions'>;
export type VerifyIpnCallInputMap = ExtractFromRegistry<'VerifyIpnCallInput'>;
export type VerifyIpnCallResultMap = ExtractFromRegistry<'VerifyIpnCallResult'>;
export type VerifyIpnCallOptionsMap = ExtractFromRegistry<'VerifyIpnCallOptions'>;
export type QueryDrInputMap = ExtractFromRegistry<'QueryDrInput'>;
export type QueryDrResultMap = ExtractFromRegistry<'QueryDrResult'>;
export type QueryDrOptionsMap = ExtractFromRegistry<'QueryDrOptions'>;
export type RefundInputMap = ExtractFromRegistry<'RefundInput'>;
export type RefundResultMap = ExtractFromRegistry<'RefundResult'>;
export type RefundOptionsMap = ExtractFromRegistry<'RefundOptions'>;
