import { LoggerData, LoggerOptions } from '../../common/types/logger.type';
import { MomoLocale, RequestType } from '../enums';
import { DefaultConfig } from './common.type';

export interface BuildPaymentUrl {
  subPartnerCode?: string; // Định danh M4B; chỉ áp dụng cho Master Merchant / 3PSP
  storeName?: string; // Tên đối tác

  requestId: string; // Định danh duy nhất cho mỗi yêu cầu (dùng để xử lý idempotency) -> khuyến khích dùng uuid v4
  requestType?: RequestType; // -> cấu hình sẵn ở config
  amount: number; // Số tiền cần thanh toán (VND) (min 1.000, max 50.000.000)
  orderId: string; // Mã đơn hàng của đối tác
  orderInfo: string; // Thông tin đơn hàng
  orderGroupId?: number; // Mã nhóm đơn hàng do MoMo cấp để phân nhóm hoạt động bán hàng

  redirectUrl?: string; // URL chuyển trang sau khi khách thanh toán (hỗ trợ AppLink/WebLink)
  ipnUrl: string; // API callback server-to-server nhận kết quả thanh toán (IPN)

  extraData: string; // Encode base64 theo dạng JSON: {"key":"value"} (dùng để gửi dữ liệu kèm)

  items?: Items[]; // Danh sách sản phẩm hiển thị trên trang thanh toán (tối đa 50 SP)
  deliveryInfo?: deliveryInfo; // Thông tin giao hàng của đơn hàng
  userInfo?: userInfo; // Thông tin người dùng

  referenceId?: string; // Mã tham chiếu phụ của đối tác
  autoCapture?: boolean; // false: không tự động capture; mặc định true
  lang?: MomoLocale; // Ngôn ngữ message trả về (vi hoặc en) -> cấu hình sẵn ở config

  // signature: string; // generateSignature // Chữ ký HMAC_SHA256 (data theo thứ tự sort a-z như docs)
}

export type BuildPaymentUrlResponse = {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink: string;
};

export type BuildPaymentUrlLogger = LoggerData<
  {
    createdAt: Date;
    paymentUrl: string;
  } & DefaultConfig &
    BuildPaymentUrl
>;

export type BuildPaymentUrlOptions<Fields extends keyof BuildPaymentUrlLogger> = {
  withHash?: boolean;
} & LoggerOptions<BuildPaymentUrlLogger, Fields>;

type Items = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  manufacturer?: string;
  price: number;
  currency: 'VND';
  quantity: number;
  unit?: string;
  totalPrice: number;
  taxAmount?: string;
};

type deliveryInfo = {
  deliveryAddress?: string;
  deliveryFee?: string;
  quantity?: string;
};

type userInfo = {
  name?: string;
  phoneNumber?: string;
  email?: string;
};
