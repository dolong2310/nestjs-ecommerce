import envConfig from '@/shared/config';
import { Momo, VNPay } from '@/shared/payment-providers';
import { EnumPaymentMethod, PaymentFactory, PaymentMethod } from '@/shared/payment-providers/core';
import { CartItemIncludeSkuAndProductType } from '@/shared/types/shared-cart.type';
import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

const HOST = envConfig.API_URL;

@Injectable()
export class SharedPaymentService {
  public readonly vnpay: PaymentFactory<typeof EnumPaymentMethod.VNPAY>;
  public readonly momo: PaymentFactory<typeof EnumPaymentMethod.MOMO>;

  constructor() {
    this.vnpay = new PaymentFactory(EnumPaymentMethod.VNPAY, {
      tmnCode: envConfig.VNPAY_TMN_CODE,
      secureSecret: envConfig.VNPAY_SECURE_SECRET,
      vnpayHost: envConfig.VNPAY_HOST,
      hashAlgorithm: VNPay.HashAlgorithm.SHA512,
      testMode: true,
    });

    this.momo = new PaymentFactory(EnumPaymentMethod.MOMO, {
      partnerCode: envConfig.MOMO_PARTNER_CODE,
      accessKey: envConfig.MOMO_ACCESS_KEY,
      secretKey: envConfig.MOMO_SECRET_KEY,
      storeId: envConfig.MOMO_STORE_ID,
      storeName: envConfig.MOMO_STORE_NAME,
      requestType: Momo.RequestType.PAY_WITH_METHOD,
      lang: Momo.MomoLocale.VI,
      testMode: true,
    });
  }

  public async buildPaymentUrl(props: {
    method: PaymentMethod;
    userId: number;
    paymentId: number;
    cartItems: CartItemIncludeSkuAndProductType[];
    ip: string;
  }): Promise<string> {
    const { method, userId, paymentId, cartItems, ip } = props;
    const totalAmount = cartItems.reduce((total, cartItem) => {
      return total + cartItem.sku.price * cartItem.quantity;
    }, 0);

    switch (method) {
      case EnumPaymentMethod.MOMO:
        return this._buildPaymentUrlMomo({ userId, paymentId, cartItems, totalAmount, ip });
      case EnumPaymentMethod.VNPAY:
        return this._buildPaymentUrlVNPay({ userId, paymentId, cartItems, totalAmount, ip });
      default:
        throw new BadRequestException('Invalid payment method');
    }
  }

  private async _buildPaymentUrlVNPay(props: {
    userId: number;
    paymentId: number;
    cartItems: CartItemIncludeSkuAndProductType[];
    totalAmount: number;
    ip: string;
  }): Promise<string> {
    const { userId, paymentId, totalAmount, ip } = props;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = await this.vnpay.buildPaymentUrl({
      vnp_Amount: totalAmount,
      vnp_IpAddr: ip, // '127.0.0.1'
      vnp_TxnRef: `${userId}-${paymentId}`,
      vnp_OrderInfo: `Payment for order ${userId}-${paymentId}`,
      vnp_OrderType: VNPay.ProductCode.Other,
      vnp_ReturnUrl: `${HOST}/payment/vnpay-return`,
      vnp_Locale: VNPay.VnpLocale.VN,
      vnp_CreateDate: VNPay.dateFormat(new Date()),
      vnp_ExpireDate: VNPay.dateFormat(tomorrow),
    });

    return paymentUrl;
  }

  private async _buildPaymentUrlMomo(props: {
    userId: number;
    paymentId: number;
    cartItems: CartItemIncludeSkuAndProductType[];
    totalAmount: number;
    ip: string;
  }): Promise<string> {
    const { userId, paymentId, cartItems, totalAmount, ip } = props;

    const paymentUrl = await this.momo.buildPaymentUrl({
      requestId: uuidv4(),
      amount: totalAmount,
      orderId: `${userId}-${paymentId}`,
      orderInfo: `Payment for order ${userId}-${paymentId}`,
      redirectUrl: `${HOST}/payment/momo-return`,
      ipnUrl: `${HOST}/payment/momo-ipn`,
      extraData: JSON.stringify({
        userId,
        paymentId,
        cartItems,
        ip,
      }),
      items: cartItems.map((cartItem) => ({
        id: cartItem.sku.id.toString(),
        name: cartItem.sku.value,
        price: cartItem.sku.price,
        quantity: cartItem.quantity,
        currency: 'VND',
        totalPrice: cartItem.sku.price * cartItem.quantity,
      })),
      deliveryInfo: {
        deliveryAddress: '123 Nguyen Van Linh, Q9, TP.HCM',
        deliveryFee: '10000',
        quantity: '1',
      },
      userInfo: {
        name: 'John Doe',
        phoneNumber: '0909090909',
        email: 'john.doe@example.com',
      },
      // subPartnerCode
      // storeName
      // requestType
      // orderGroupId
      // referenceId
      // autoCapture
      // lang
    });

    return paymentUrl;
  }
}
