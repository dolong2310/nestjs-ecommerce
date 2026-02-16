import crypto from 'crypto';
import { BuildPaymentUrl, GlobalConfig, QueryDr, Refund, ReturnQueryFromMomo } from '../types';
import { MomoLocale } from '../enums';
import { RESPONSE_MAP } from '../constants';

/**
 * Tạo chữ ký HMAC-SHA256 cho Momo
 * @en Generate HMAC-SHA256 signature for Momo
 *
 * @param {string} secretKey - Secret key từ Momo
 * @param {string} rawSignature - Chuỗi raw signature cần mã hóa
 * @returns {string} - Chữ ký đã được mã hóa
 */
export function generateSignature(secretKey: string, rawSignature: string): string {
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
}

/**
 * Xây dựng raw signature cho payment request
 * @en Build raw signature for payment request
 *
 * @param {Object} data - Dữ liệu để tạo signature
 * @returns {string} - Raw signature string
 */
export function buildPaymentRawSignature(
  data: Omit<BuildPaymentUrl, 'lang' | 'autoCapture' | 'orderGroupId'> &
    Pick<GlobalConfig, 'partnerCode' | 'accessKey'>,
): string {
  const { accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType } =
    data;

  return (
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType
  );
}

/**
 * Xây dựng raw signature cho query transaction
 * @en Build raw signature for query transaction
 *
 * @param {Object} data - Dữ liệu để tạo signature
 * @returns {string} - Raw signature string
 */
export function buildQueryRawSignature(
  data: Pick<GlobalConfig, 'accessKey' | 'partnerCode'> & Pick<QueryDr, 'orderId' | 'requestId'>,
): string {
  const { accessKey, orderId, partnerCode, requestId } = data;

  return 'accessKey=' + accessKey + '&orderId=' + orderId + '&partnerCode=' + partnerCode + '&requestId=' + requestId;
}

/**
 * Xây dựng raw signature cho refund transaction
 * @en Build raw signature for refund transaction
 *
 * @param {Object} data - Dữ liệu để tạo signature
 * @returns {string} - Raw signature string
 */
export function buildRefundRawSignature(
  data: Pick<GlobalConfig, 'accessKey' | 'partnerCode'> &
    Pick<Refund, 'orderId' | 'requestId' | 'transId' | 'amount' | 'description'>,
): string {
  const { accessKey, amount, description = '', orderId, partnerCode, requestId, transId } = data;

  return (
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&description=' +
    description +
    '&orderId=' +
    orderId +
    '&partnerCode=' +
    partnerCode +
    '&requestId=' +
    requestId +
    '&transId=' +
    transId
  );
}

/**
 * Xác thực signature từ Momo callback/IPN
 * @en Verify signature from Momo callback/IPN
 *
 * @param {Object} data - Dữ liệu từ Momo callback
 * @param {string} secretKey - Secret key từ Momo
 * @returns {boolean} - True nếu signature hợp lệ
 */
export function verifySignature(data: ReturnQueryFromMomo & Pick<GlobalConfig, 'accessKey'>, secretKey: string) {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = data;

  const rawSignature =
    'accessKey=' +
    (data.accessKey || '') +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&message=' +
    message +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&orderType=' +
    orderType +
    '&partnerCode=' +
    partnerCode +
    '&payType=' +
    payType +
    '&requestId=' +
    requestId +
    '&responseTime=' +
    responseTime +
    '&resultCode=' +
    resultCode +
    '&transId=' +
    transId;

  const calculatedSignature = generateSignature(secretKey, rawSignature);
  return calculatedSignature === signature;
}

/**
 * Sắp xếp object theo key (dùng cho việc build query string)
 * @en Sort object by keys (used for building query strings)
 *
 * @param {Object} obj - Object cần sắp xếp
 * @returns {Object} - Object đã được sắp xếp
 */
export function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

/**
 * Generate unique orderId for Momo
 * @en Generate unique orderId for Momo
 *
 * @param {string} partnerCode - Partner code
 * @returns {string} - Unique order ID
 */
export function generateOrderId(partnerCode: string = 'MOMO'): string {
  return partnerCode + new Date().getTime();
}

export function getResponseByStatusCode(
  responseCode = 0,
  locale: MomoLocale = MomoLocale.VI,
  responseMap = RESPONSE_MAP,
): string {
  const respondText: Record<MomoLocale, string> = responseMap.get(responseCode) as Record<MomoLocale, string>; // ?? (responseMap.get('default') as Record<MomoLocale, string>);

  return respondText[locale];
}
