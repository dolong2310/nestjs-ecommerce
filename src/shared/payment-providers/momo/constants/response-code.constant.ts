import { MomoLocale } from '../enums';

// Momo response codes mapping
export const MomoResponseCode = {
  SUCCESS: 0, // Thành công

  SYSTEM_MAINTENANCE: 10, // Hệ thống đang được bảo trì
  ACCESS_DENIED: 11, // Truy cập bị từ chối
  UNSUPPORTED_API_VERSION: 12, // Phiên bản API không được hỗ trợ cho yêu cầu này
  BUSINESS_AUTHENTICATION_FAILED: 13, // Xác thực doanh nghiệp thất bại

  INVALID_REQUEST: 20, // Yêu cầu sai định dạng
  INVALID_AMOUNT_CHECK: 21, // Yêu cầu kiểm tra số tiền giao dịch không hợp lệ
  INVALID_PAYMENT_DATA: 22, // Dữ liệu/ thông tin thanh toán không hợp lệ

  INVALID_PARAMETER: 40, // Request bị từ chối vì tham số không hợp lệ
  DUPLICATE_ORDER_ID: 41, // orderId bị trùng
  ORDER_ID_NOT_FOUND_OR_INVALID: 42, // orderId không hợp lệ hoặc không được tìm thấy
  CONFLICT_REQUEST: 43, // Yêu cầu bị từ chối vì xung đột trong quá trình xử lý giao dịch
  DUPLICATE_ITEM_ID: 45, // Trùng itemId
  INVALID_DATA_IN_LIST: 47, // Yêu cầu bị từ chối vì thông tin không hợp lệ trong danh sách dữ liệu

  QR_CREATE_FAILED: 98, // QR Code tạo không thành công
  UNKNOWN_ERROR: 99, // Lỗi không xác định

  TRANSACTION_CREATED_WAITING_USER: 1000, // Giao dịch đã được khởi tạo, chờ người dùng thanh toán
  INSUFFICIENT_BALANCE: 1001, // Giao dịch thất bại do tài khoản người dùng không đủ tiền
  DECLINED_BY_ISSUER: 1002, // Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán
  CANCELLED_BY_MERCHANT_OR_TIMEOUT: 1003, // Giao dịch bị hủy bởi doanh nghiệp hoặc do timeout
  EXCEED_USER_AMOUNT_LIMIT: 1004, // Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức
  QR_EXPIRED: 1005, // Giao dịch thất bại do QR code đã hết hạn
  USER_REJECTED_PAYMENT: 1006, // Giao dịch thất bại do người dùng từ chối xác nhận thanh toán
  ACCOUNT_NOT_EXIST_OR_SUSPENDED: 1007, // Tài khoản không tồn tại hoặc đang tạm ngưng

  CANCELLED_BY_PARTNER: 1017, // Giao dịch bị hủy bởi đối tác

  INVALID_PROMOTION_RULE: 1026, // Giao dịch không hợp lệ theo thể lệ chương trình khuyến mãi

  REFUND_FAILED: 1080, // Giao dịch hoàn tiền thất bại
  REFUND_DECLINED_OR_EXCEED_ORIGINAL: 1081, // Giao dịch hoàn tiền bị từ chối / vượt quá số tiền cho phép
  REFUND_NOT_SUPPORTED: 1088, // Giao dịch hoàn tiền bị từ chối vì không được hỗ trợ

  INVALID_ORDER_GROUP_ID: 2019, // Yêu cầu bị từ chối vì orderGroupId không hợp lệ

  ACCOUNT_LOCKED: 4001, // Giao dịch bị từ chối do tài khoản người dùng đang bị khóa
  ACCOUNT_NOT_VERIFIED: 4002, // Giao dịch bị từ chối do tài khoản người dùng chưa được xác thực

  USER_LOGIN_FAILED: 4100, // Giao dịch thất bại do người dùng không đăng nhập thành công

  TRANSACTION_PROCESSING: 7000, // Giao dịch đang được xử lý
  TRANSACTION_PROCESSING_BY_PROVIDER: 7002, // Giao dịch đang được xử lý bởi nhà cung cấp thanh toán

  FINAL_SUCCESS: 9000, // Giao dịch đã được xác nhận thành công
} as const;

export const RESPONSE_MAP = new Map<number, Record<MomoLocale, string>>([
  [
    MomoResponseCode.SUCCESS,
    {
      [MomoLocale.VI]: 'Giao dịch thành công',
      [MomoLocale.EN]: 'Transaction successful',
    },
  ],
  [
    MomoResponseCode.SYSTEM_MAINTENANCE,
    {
      [MomoLocale.VI]: 'Hệ thống đang được bảo trì',
      [MomoLocale.EN]: 'System under maintenance',
    },
  ],
  [
    MomoResponseCode.ACCESS_DENIED,
    {
      [MomoLocale.VI]: 'Truy cập bị từ chối',
      [MomoLocale.EN]: 'Access denied',
    },
  ],
  [
    MomoResponseCode.UNSUPPORTED_API_VERSION,
    {
      [MomoLocale.VI]: 'Phiên bản API không được hỗ trợ cho yêu cầu này',
      [MomoLocale.EN]: 'API version is not supported for this request',
    },
  ],
  [
    MomoResponseCode.BUSINESS_AUTHENTICATION_FAILED,
    {
      [MomoLocale.VI]: 'Xác thực doanh nghiệp thất bại',
      [MomoLocale.EN]: 'Business authentication failed',
    },
  ],

  [
    MomoResponseCode.INVALID_REQUEST,
    {
      [MomoLocale.VI]: 'Yêu cầu sai định dạng',
      [MomoLocale.EN]: 'Invalid request format',
    },
  ],
  [
    MomoResponseCode.INVALID_AMOUNT_CHECK,
    {
      [MomoLocale.VI]: 'Yêu cầu kiểm tra số tiền giao dịch không hợp lệ',
      [MomoLocale.EN]: 'Invalid transaction amount check request',
    },
  ],
  [
    MomoResponseCode.INVALID_PAYMENT_DATA,
    {
      [MomoLocale.VI]: 'Dữ liệu/thông tin thanh toán không hợp lệ',
      [MomoLocale.EN]: 'Invalid payment data',
    },
  ],

  [
    MomoResponseCode.INVALID_PARAMETER,
    {
      [MomoLocale.VI]: 'Request bị từ chối vì tham số không hợp lệ',
      [MomoLocale.EN]: 'Request rejected due to invalid parameter',
    },
  ],
  [
    MomoResponseCode.DUPLICATE_ORDER_ID,
    {
      [MomoLocale.VI]: 'Mã đơn hàng (orderId) bị trùng',
      [MomoLocale.EN]: 'Duplicate orderId',
    },
  ],
  [
    MomoResponseCode.ORDER_ID_NOT_FOUND_OR_INVALID,
    {
      [MomoLocale.VI]: 'orderId không hợp lệ hoặc không được tìm thấy',
      [MomoLocale.EN]: 'orderId is invalid or not found',
    },
  ],
  [
    MomoResponseCode.CONFLICT_REQUEST,
    {
      [MomoLocale.VI]: 'Yêu cầu bị từ chối vì xung đột trong quá trình xử lý giao dịch',
      [MomoLocale.EN]: 'Request rejected due to processing conflict',
    },
  ],
  [
    MomoResponseCode.DUPLICATE_ITEM_ID,
    {
      [MomoLocale.VI]: 'Trùng itemId',
      [MomoLocale.EN]: 'Duplicate itemId',
    },
  ],
  [
    MomoResponseCode.INVALID_DATA_IN_LIST,
    {
      [MomoLocale.VI]: 'Thông tin không hợp lệ trong danh sách dữ liệu',
      [MomoLocale.EN]: 'Invalid data in list',
    },
  ],

  [
    MomoResponseCode.QR_CREATE_FAILED,
    {
      [MomoLocale.VI]: 'QR Code tạo không thành công',
      [MomoLocale.EN]: 'QR Code creation failed',
    },
  ],
  [
    MomoResponseCode.UNKNOWN_ERROR,
    {
      [MomoLocale.VI]: 'Lỗi không xác định',
      [MomoLocale.EN]: 'Unknown error',
    },
  ],

  [
    MomoResponseCode.TRANSACTION_CREATED_WAITING_USER,
    {
      [MomoLocale.VI]: 'Giao dịch đã được khởi tạo, chờ người dùng thanh toán',
      [MomoLocale.EN]: 'Transaction created, waiting for user payment',
    },
  ],
  [
    MomoResponseCode.INSUFFICIENT_BALANCE,
    {
      [MomoLocale.VI]: 'Tài khoản người dùng không đủ số dư',
      [MomoLocale.EN]: 'Insufficient balance',
    },
  ],
  [
    MomoResponseCode.DECLINED_BY_ISSUER,
    {
      [MomoLocale.VI]: 'Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán',
      [MomoLocale.EN]: 'Transaction declined by issuer',
    },
  ],
  [
    MomoResponseCode.CANCELLED_BY_MERCHANT_OR_TIMEOUT,
    {
      [MomoLocale.VI]: 'Giao dịch bị hủy bởi doanh nghiệp hoặc do hết thời gian (timeout)',
      [MomoLocale.EN]: 'Transaction cancelled by merchant or timed out',
    },
  ],
  [
    MomoResponseCode.EXCEED_USER_AMOUNT_LIMIT,
    {
      [MomoLocale.VI]: 'Số tiền thanh toán vượt quá hạn mức của người dùng',
      [MomoLocale.EN]: 'Payment amount exceeds user limit',
    },
  ],
  [
    MomoResponseCode.QR_EXPIRED,
    {
      [MomoLocale.VI]: 'QR code đã hết hạn',
      [MomoLocale.EN]: 'QR code expired',
    },
  ],
  [
    MomoResponseCode.USER_REJECTED_PAYMENT,
    {
      [MomoLocale.VI]: 'Người dùng từ chối xác nhận thanh toán',
      [MomoLocale.EN]: 'User rejected payment',
    },
  ],
  [
    MomoResponseCode.ACCOUNT_NOT_EXIST_OR_SUSPENDED,
    {
      [MomoLocale.VI]: 'Tài khoản không tồn tại hoặc đang tạm ngưng',
      [MomoLocale.EN]: 'Account does not exist or is suspended',
    },
  ],

  [
    MomoResponseCode.CANCELLED_BY_PARTNER,
    {
      [MomoLocale.VI]: 'Giao dịch bị hủy bởi đối tác',
      [MomoLocale.EN]: 'Transaction cancelled by partner',
    },
  ],

  [
    MomoResponseCode.INVALID_PROMOTION_RULE,
    {
      [MomoLocale.VI]: 'Giao dịch không hợp lệ theo thể lệ chương trình khuyến mãi',
      [MomoLocale.EN]: 'Transaction invalid under promotion rules',
    },
  ],

  [
    MomoResponseCode.REFUND_FAILED,
    {
      [MomoLocale.VI]: 'Giao dịch hoàn tiền thất bại',
      [MomoLocale.EN]: 'Refund failed',
    },
  ],
  [
    MomoResponseCode.REFUND_DECLINED_OR_EXCEED_ORIGINAL,
    {
      [MomoLocale.VI]: 'Giao dịch hoàn tiền bị từ chối hoặc vượt quá số tiền cho phép',
      [MomoLocale.EN]: 'Refund declined or exceeds allowed/original amount',
    },
  ],
  [
    MomoResponseCode.REFUND_NOT_SUPPORTED,
    {
      [MomoLocale.VI]: 'Giao dịch hoàn tiền không được hỗ trợ',
      [MomoLocale.EN]: 'Refund not supported',
    },
  ],

  [
    MomoResponseCode.INVALID_ORDER_GROUP_ID,
    {
      [MomoLocale.VI]: 'orderGroupId không hợp lệ',
      [MomoLocale.EN]: 'Invalid orderGroupId',
    },
  ],

  [
    MomoResponseCode.ACCOUNT_LOCKED,
    {
      [MomoLocale.VI]: 'Tài khoản người dùng đang bị khóa',
      [MomoLocale.EN]: 'User account is locked',
    },
  ],
  [
    MomoResponseCode.ACCOUNT_NOT_VERIFIED,
    {
      [MomoLocale.VI]: 'Tài khoản người dùng chưa được xác thực',
      [MomoLocale.EN]: 'User account not verified',
    },
  ],

  [
    MomoResponseCode.USER_LOGIN_FAILED,
    {
      [MomoLocale.VI]: 'Người dùng không đăng nhập thành công',
      [MomoLocale.EN]: 'User login failed',
    },
  ],

  [
    MomoResponseCode.TRANSACTION_PROCESSING,
    {
      [MomoLocale.VI]: 'Giao dịch đang được xử lý',
      [MomoLocale.EN]: 'Transaction is processing',
    },
  ],
  [
    MomoResponseCode.TRANSACTION_PROCESSING_BY_PROVIDER,
    {
      [MomoLocale.VI]: 'Giao dịch đang được xử lý bởi nhà cung cấp thanh toán',
      [MomoLocale.EN]: 'Transaction is processing by payment provider',
    },
  ],

  [
    MomoResponseCode.FINAL_SUCCESS,
    {
      [MomoLocale.VI]: 'Giao dịch đã được xác nhận thành công',
      [MomoLocale.EN]: 'Transaction has been finally confirmed as successful',
    },
  ],
]);
