# Payment Providers Pattern - Namespace Exports

## 🎯 Vấn đề
Khi có nhiều payment providers (VNPay, Momo, ZaloPay, ...) cùng export các types có tên giống nhau (ví dụ: `BuildPaymentUrl`, `QueryDr`, `Refund`, ...), sẽ gây ra conflict khi export tất cả trong cùng một file.

```typescript
// ❌ CONFLICT - Các types bị trùng tên
export * from './vnpay';  // export BuildPaymentUrl
export * from './momo';   // export BuildPaymentUrl -> CONFLICT!
```

## ✅ Giải pháp: Namespace Exports Pattern

### 1. Cấu trúc thư mục

```
src/shared/payment-providers/
├── index.ts                    # Main export file
├── interfaces/                 # Shared interfaces
│   ├── index.ts
│   └── payment-provider.interface.ts
├── core/                       # Factory pattern
│   ├── index.ts
│   └── constants/
├── vnpay/                      # VNPay provider
│   ├── index.ts               # Export all vnpay types
│   ├── types/
│   ├── core/
│   └── constants/
└── momo/                       # Momo provider
    ├── index.ts               # Export all momo types
    ├── types/
    ├── core/
    └── constants/
```

### 2. Export Pattern

#### File: `src/shared/payment-providers/index.ts`

```typescript
// Interfaces (shared interfaces cho tất cả providers)
export * from './interfaces';

// Providers - Export dưới dạng namespace để tránh conflict
export * as VNPay from './vnpay';
export * as Momo from './momo';

// Factory
export * from './core';
```

**Lợi ích:**
- ✅ Tránh conflict giữa các providers
- ✅ Rõ ràng về nguồn gốc của types (VNPay.Type vs Momo.Type)
- ✅ Dễ dàng thêm provider mới (ZaloPay, PayPal, ...)
- ✅ Auto-complete tốt hơn trong IDE

### 3. Cách sử dụng

#### Option 1: Import namespace (Recommended)

```typescript
import PaymentFactory from '@/shared/payment-providers/core';
import { EnumPaymentMethod } from '@/shared/payment-providers/core/constants';
import { VNPay } from '@/shared/payment-providers';

// Sử dụng types từ VNPay namespace
const config = {
  hashAlgorithm: VNPay.HashAlgorithm.SHA512,
  // ...
};

// Type annotations
async verifyIpnVNPay(query: VNPay.ReturnQueryFromVNPay): Promise<VNPay.IpnResponse> {
  // ...
}

// Sử dụng constants
const paymentUrl = vnpay.buildPaymentUrl({
  vnp_OrderType: VNPay.ProductCode.Other,
  vnp_Locale: VNPay.VnpLocale.VN,
  vnp_CreateDate: VNPay.dateFormat(new Date()),
  // ...
});
```

#### Option 2: Import cả VNPay và Momo

```typescript
import { VNPay, Momo } from '@/shared/payment-providers';

// Phân biệt rõ ràng giữa các providers
const vnpayConfig = {
  hashAlgorithm: VNPay.HashAlgorithm.SHA512,
};

const momoConfig = {
  hashAlgorithm: Momo.HashAlgorithm.SHA256,
};
```

#### Option 3: Destructure specific types (Advanced)

```typescript
// TypeScript 4.5+ hỗ trợ destructure namespace
import { VNPay } from '@/shared/payment-providers';

// Extract specific types
type VNPayHashAlgorithm = VNPay.HashAlgorithm;
type VNPayProductCode = VNPay.ProductCode;

// Sử dụng
const algo: VNPayHashAlgorithm = VNPay.HashAlgorithm.SHA512;
```

### 4. Ví dụ thực tế

#### Payment Service

```typescript
// src/routes/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import PaymentFactory from '@/shared/payment-providers/core';
import { EnumPaymentMethod } from '@/shared/payment-providers/core/constants';
import { VNPay } from '@/shared/payment-providers';

@Injectable()
export class PaymentService {
  private readonly vnpay: PaymentFactory;

  constructor() {
    this.vnpay = new PaymentFactory(EnumPaymentMethod.VNPAY, {
      tmnCode: envConfig.VNPAY_TMN_CODE,
      secureSecret: envConfig.VNPAY_SECURE_SECRET,
      vnpayHost: envConfig.VNPAY_HOST,
      testMode: true,
      hashAlgorithm: VNPay.HashAlgorithm.SHA512,
    });
  }

  async verifyIpnVNPay(query: VNPay.ReturnQueryFromVNPay): Promise<VNPay.IpnResponse> {
    const ipn = this.vnpay.verifyIpnCall(query);

    if (!ipn.isVerified) {
      return VNPay.IpnFailChecksum;
    }

    // ... business logic

    return VNPay.IpnSuccess;
  }

  verifyReturnVNPay(query: VNPay.ReturnQueryFromVNPay): MessageResponseType {
    const verify: VNPay.VerifyReturnUrl = this.vnpay.verifyReturnUrl(query);
    
    if (!verify.isVerified) {
      throw new BadRequestException('Payment failed!');
    }

    return { message: 'Payment successful!' };
  }
}
```

#### Order Service

```typescript
// src/routes/order/order.service.ts
import { Injectable } from '@nestjs/common';
import PaymentFactory from '@/shared/payment-providers/core';
import { EnumPaymentMethod } from '@/shared/payment-providers/core/constants';
import { VNPay } from '@/shared/payment-providers';

@Injectable()
export class OrderService {
  private _buildPaymentUrl({ userId, paymentId, cartItems, ip }) {
    const vnpay = new PaymentFactory(EnumPaymentMethod.VNPAY, {
      tmnCode: envConfig.VNPAY_TMN_CODE,
      secureSecret: envConfig.VNPAY_SECURE_SECRET,
      vnpayHost: envConfig.VNPAY_HOST,
      testMode: true,
      hashAlgorithm: VNPay.HashAlgorithm.SHA512,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return vnpay.buildPaymentUrl({
      vnp_Amount: totalAmount,
      vnp_IpAddr: ip,
      vnp_TxnRef: `${userId}-${paymentId}`,
      vnp_OrderInfo: `Payment for order ${userId}`,
      vnp_OrderType: VNPay.ProductCode.Other,
      vnp_ReturnUrl: 'https://example.com/api/v1/payment/vnpay-return',
      vnp_Locale: VNPay.VnpLocale.VN,
      vnp_CreateDate: VNPay.dateFormat(new Date()),
      vnp_ExpireDate: VNPay.dateFormat(tomorrow),
    });
  }
}
```

## 🚀 Mở rộng thêm Payment Provider mới

### Bước 1: Tạo thư mục provider mới

```bash
src/shared/payment-providers/
└── zalopay/
    ├── index.ts              # Export all zalopay types
    ├── types/
    │   ├── index.ts
    │   ├── build-payment-url.type.ts
    │   └── query-dr.type.ts
    ├── core/
    │   ├── index.ts
    │   └── zalopay-payment.service.ts
    └── constants/
        └── index.ts
```

### Bước 2: Export trong file chính

```typescript
// src/shared/payment-providers/index.ts
export * from './interfaces';

// Thêm ZaloPay namespace
export * as VNPay from './vnpay';
export * as Momo from './momo';
export * as ZaloPay from './zalopay';  // ✅ Thêm provider mới

export * from './core';
```

### Bước 3: Sử dụng

```typescript
import { ZaloPay } from '@/shared/payment-providers';

const zaloPayConfig = {
  appId: envConfig.ZALOPAY_APP_ID,
  key1: envConfig.ZALOPAY_KEY1,
  endpoint: ZaloPay.Endpoint.CREATE_ORDER,
};
```

## 📋 Best Practices

### ✅ DO

```typescript
// 1. Import namespace
import { VNPay, Momo } from '@/shared/payment-providers';

// 2. Sử dụng types với namespace prefix
const verify: VNPay.VerifyReturnUrl = vnpay.verifyReturnUrl(query);

// 3. Rõ ràng về provider đang sử dụng
const vnpayHash = VNPay.HashAlgorithm.SHA512;
const momoHash = Momo.HashAlgorithm.SHA256;
```

### ❌ DON'T

```typescript
// 1. KHÔNG import trực tiếp từ sub-path (bypass namespace)
import { HashAlgorithm } from '@/shared/payment-providers/vnpay';
// Use: import { VNPay } from '@/shared/payment-providers'

// 2. KHÔNG export * trực tiếp (gây conflict)
export * from './vnpay';
export * from './momo';

// 3. KHÔNG mix styles
import { VNPay } from '@/shared/payment-providers';
import { HashAlgorithm } from '@/shared/payment-providers/vnpay'; // ❌ Inconsistent
```

## 🔍 So sánh Pattern

### Pattern 1: Export all (❌ BAD - Có conflict)

```typescript
// index.ts
export * from './vnpay';
export * from './momo';

// Error: Duplicate exports
```

### Pattern 2: Named re-exports (⚠️ OK but verbose)

```typescript
// index.ts
export {
  HashAlgorithm as VNPayHashAlgorithm,
  ProductCode as VNPayProductCode,
  // ... 50+ exports
} from './vnpay';

export {
  HashAlgorithm as MomoHashAlgorithm,
  ProductCode as MomoProductCode,
  // ... 50+ exports
} from './momo';

// Usage
import { VNPayHashAlgorithm } from '@/shared/payment-providers';
```

### Pattern 3: Namespace exports (✅ BEST - Recommended)

```typescript
// index.ts
export * as VNPay from './vnpay';
export * as Momo from './momo';

// Usage
import { VNPay } from '@/shared/payment-providers';
const algo = VNPay.HashAlgorithm.SHA512;
```

## 📝 Checklist khi thêm Provider mới

- [ ] Tạo folder provider mới theo cấu trúc chuẩn
- [ ] Export tất cả types trong `provider/index.ts`
- [ ] Thêm namespace export trong `payment-providers/index.ts`
- [ ] Update Factory để support provider mới
- [ ] Viết tests cho provider mới
- [ ] Update documentation (README, API docs)
- [ ] Thêm environment variables cho config
- [ ] Thêm validation cho config

## 🎓 Tài liệu tham khảo

- [TypeScript Module Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [ES6 Module Exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)

---

**Lưu ý:** Pattern này giúp code dễ maintain, scalable và rõ ràng hơn khi có nhiều payment providers với types tương tự nhau.
