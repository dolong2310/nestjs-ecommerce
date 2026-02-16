// Momo request types
export enum RequestType {
  CAPTURE_WALLET = 'captureWallet', // Thanh toán ví Momo
  PAY_WITH_ATM = 'payWithATM', // Thanh toán qua thẻ ATM
  PAY_WITH_CREDIT = 'payWithCredit', // Thanh toán qua thẻ tín dụng
  PAY_WITH_METHOD = 'payWithMethod', // Thanh toán với nhiều phương thức
}

// Momo language
export enum MomoLocale {
  VI = 'vi',
  EN = 'en',
}
