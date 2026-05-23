# NestJS Ecommerce API

[English](README.md) | Tiếng Việt

Backend API cho hệ thống ecommerce/marketplace, được xây dựng với NestJS, Prisma, PostgreSQL, Redis và Socket.IO. Dự án tập trung vào các luồng backend cốt lõi của một hệ thống thương mại điện tử thực tế: xác thực, phân quyền, danh mục sản phẩm, giỏ hàng, đơn hàng, thanh toán, upload media, coupon, review và launchpad campaign.

## Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Cài Đặt](#cài-đặt)
- [Biến Môi Trường](#biến-môi-trường)
- [Database](#database)
- [Tài Liệu API](#tài-liệu-api)
- [Scripts](#scripts)
- [Ghi Chú Về Security & Architecture](#ghi-chú-về-security--architecture)
- [Testing](#testing)
- [Docker](#docker)
- [Roadmap](#roadmap)

## Tổng Quan

Dự án này là một backend ecommerce được thiết kế theo hướng modular, phục vụ cho ba nhóm người dùng chính: buyer, seller và admin.

- Buyer có thể đăng ký, đăng nhập, xem sản phẩm, quản lý giỏ hàng, tạo đơn hàng, thanh toán qua cổng thanh toán, dùng coupon và review sản phẩm.
- Seller/admin có thể quản lý sản phẩm, SKU, brand, category, coupon, launchpad campaign, user, role và permission.
- Hệ thống hỗ trợ dữ liệu đa ngôn ngữ cho product/category/brand, upload media, payment webhook/IPN callback, Redis cache/queue và WebSocket namespace.

Codebase được tổ chức theo feature module. Mỗi business domain trong `src/routes` thường có controller, service, repository, DTO, model, error và type riêng.

## Tính Năng

- Authentication bằng email/password, refresh token, forgot password, Google OAuth và 2FA OTP.
- Role-based access control với các role `ADMIN`, `SELLER`, `USER`.
- Tự động đồng bộ permission từ các route đã đăng ký trong NestJS.
- Product catalog với product, SKU, brand, category và translation.
- Quản lý cart và order.
- Tích hợp thanh toán MoMo và VNPay, bao gồm return URL và IPN/webhook verification.
- Quản lý coupon với giảm giá theo số tiền cố định hoặc phần trăm.
- Review sản phẩm.
- Launchpad campaign với lifecycle status và cronjob hết hạn.
- Upload media qua endpoint local và S3 presigned URL.
- Redis-backed cache, BullMQ queue và Socket.IO Redis adapter.
- Global validation/serialization bằng Zod.
- API versioning với `/api/v1`.
- Swagger/OpenAPI documentation.
- Docker Compose setup cho PostgreSQL, Redis và application.

## Tech Stack

| Nhóm | Công nghệ |
| --- | --- |
| Runtime | Node.js 20 |
| Framework | NestJS 11, TypeScript |
| Database | PostgreSQL, Prisma 7 |
| Cache / Queue | Redis, BullMQ, cache-manager |
| Realtime | Socket.IO, Socket.IO Redis adapter |
| Auth | JWT, bcrypt, Google OAuth, OTPAuth |
| Validation | Zod, nestjs-zod |
| API Docs | Swagger/OpenAPI |
| Storage | AWS S3 |
| Email | Resend |
| Payment | MoMo, VNPay |
| Security | Helmet, CORS, throttling, API key guards |
| DevOps | Docker, Docker Compose |

## Cấu Trúc Dự Án

```txt
.
├── prisma/                    # Prisma schema và migration history
├── scripts/                   # Script khởi tạo dữ liệu và đồng bộ permission
├── src/
│   ├── app.module.ts          # Root module và global providers
│   ├── main.ts                # Bootstrap app, Swagger, CORS, versioning
│   ├── cronjobs/              # Scheduled jobs
│   ├── queues/                # BullMQ consumers
│   ├── routes/                # Feature modules
│   │   ├── auth/
│   │   ├── brand/
│   │   ├── cart/
│   │   ├── category/
│   │   ├── coupon/
│   │   ├── language/
│   │   ├── launchpad/
│   │   ├── media/
│   │   ├── order/
│   │   ├── payment/
│   │   ├── permission/
│   │   ├── product/
│   │   ├── profile/
│   │   ├── review/
│   │   ├── role/
│   │   └── user/
│   ├── shared/                # Guards, decorators, pipes, filters, services, constants
│   └── websockets/            # Socket.IO gateways và Redis adapter
├── docker-compose.yml
├── Dockerfile
└── package.json
```

Pattern thường gặp bên trong một feature module:

```txt
feature/
├── feature.controller.ts      # HTTP endpoints
├── feature.service.ts         # Business logic
├── feature.repo.ts            # Database access
├── feature.dto.ts             # Request/response DTOs
├── feature.model.ts           # API models
├── feature.error.ts           # Domain errors
└── feature.type.ts            # Types
```

## Cài Đặt

### Yêu cầu

- Node.js 20+
- npm
- Docker và Docker Compose

### 1. Cài dependencies

```bash
npm install
```

### 2. Chạy PostgreSQL và Redis

```bash
docker compose up -d postgres redis
```

Default local database URL trong `docker-compose.yml`:

```txt
postgresql://dolong:@localhost:5432/nestjs_ecommerce?schema=public
```

### 3. Tạo file `.env`

Tạo file `.env` ở root của project. Xem phần [Biến Môi Trường](#biến-môi-trường) để biết các key bắt buộc.

### 4. Generate Prisma client và chạy migration

```bash
npm run db:gen
npm run db:migrate
```

### 5. Seed role cơ bản và admin account

```bash
npm run init
```

### 6. Đồng bộ permission từ route của application

```bash
npm run permissions
```

### 7. Chạy development server

```bash
npm run dev
```

API sẽ chạy tại:

```txt
http://localhost:3000/api/v1
```

Swagger documentation:

```txt
http://localhost:3000/api
```

## Biến Môi Trường

Tất cả biến môi trường được validate khi application start trong `src/shared/config.ts`. Không commit secret thật lên GitHub. Nếu muốn document default value, hãy commit file `.env.example`.

```env
PORT=3000
APP_NAME=ecommerce

DATABASE_URL=postgresql://dolong:@localhost:5432/nestjs_ecommerce?schema=public
REDIS_URL=redis://localhost:6379

SECRET_API_KEY=change-me
SECRET_PAYMENT_API_KEY=change-me

ACCESS_TOKEN_SECRET=change-me
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=change-me
REFRESH_TOKEN_EXPIRES_IN=7d

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
ADMIN_PHONE_NUMBER=0900000000

OTP_EXPIRES_IN=5m
RESEND_API_KEY=change-me

API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

GOOGLE_CLIENT_ID=change-me
GOOGLE_CLIENT_SECRET=change-me
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
GOOGLE_CLIENT_REDIRECT_URI=http://localhost:3001/auth/google/callback

MEDIA_STATIC_PREFIX_URL=http://localhost:3000/api/v1/media/static

AWS_S3_REGION=ap-southeast-1
AWS_S3_ACCESS_KEY=change-me
AWS_S3_SECRET_ACCESS_KEY=change-me
AWS_S3_BUCKET_NAME=change-me

VNPAY_TMN_CODE=change-me
VNPAY_SECURE_SECRET=change-me
VNPAY_HOST=https://sandbox.vnpayment.vn

MOMO_PARTNER_CODE=change-me
MOMO_ACCESS_KEY=change-me
MOMO_SECRET_KEY=change-me
MOMO_STORE_ID=change-me
MOMO_STORE_NAME=Ecommerce Store
```

## Database

Database schema được quản lý bằng Prisma trong `prisma/schema.prisma`.

Các domain model chính:

- `User`, `Role`, `Permission`, `RefreshToken`, `Device`, `OtpCode`
- `Product`, `SKU`, `Brand`, `Category`, translations
- `CartItem`, `Order`, `Payment`
- `Coupon`, `Review`, `Launchpad`
- `Language`, `Media`, `WebSocket`, `Message`

Các command thường dùng:

```bash
npm run db:gen        # Generate Prisma client
npm run db:migrate    # Tạo/apply development migration và regenerate client
npm run db:deploy     # Apply migrations ở production
npm run db:push       # Push schema không tạo migration
npm run db:stu        # Mở Prisma Studio
```

## Tài Liệu API

Swagger được cấu hình trong `src/main.ts`.

- Swagger UI: `http://localhost:3000/api`
- API base path: `http://localhost:3000/api/v1`
- Swagger hỗ trợ Bearer token authentication.
- Payment receiver endpoints có thể dùng security scheme `payment-api-key`.

Nhóm endpoint chính:

- `/api/v1/auth`
- `/api/v1/profile`
- `/api/v1/users`
- `/api/v1/roles`
- `/api/v1/permissions`
- `/api/v1/products`
- `/api/v1/manage-product/products`
- `/api/v1/categories`
- `/api/v1/brands`
- `/api/v1/cart`
- `/api/v1/orders`
- `/api/v1/payment`
- `/api/v1/coupons`
- `/api/v1/manage-coupon/coupons`
- `/api/v1/reviews`
- `/api/v1/launchpads`
- `/api/v1/manage-launchpad/launchpads`
- `/api/v1/media`

## Scripts

```bash
npm run dev                # Chạy NestJS ở watch mode
npm run start              # Chạy application
npm run build              # Build production bundle
npm run start:prod         # Chạy application đã build
npm run lint               # Chạy ESLint với auto-fix
npm run format             # Format source và test files
npm run test               # Chạy unit tests
npm run test:e2e           # Chạy e2e tests
npm run test:cov           # Chạy test coverage
npm run init               # Seed role cơ bản và admin user
npm run permissions        # Đồng bộ route permissions vào database và roles
```

## Ghi Chú Về Security & Architecture

- Global `AuthCompositeGuard` bảo vệ route mặc định. Route public phải được đánh dấu rõ ràng.
- RBAC được triển khai bằng role và permission, permission được đồng bộ từ các route đã đăng ký.
- Access token và refresh token được tách riêng. Refresh token được lưu kèm thông tin device.
- Các payment receiver endpoint dùng API key hoặc verify signature từ payment provider.
- Helmet, CORS và throttling được cấu hình global.
- Zod được dùng cho request validation và response serialization.
- Database access được tách qua repository class trong từng feature module.
- Redis được dùng cho cache, queue và Socket.IO scaling.
- Nhiều domain model hỗ trợ soft delete và audit fields.

## Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

Dự án hiện có setup Jest/NestJS testing. Các phần nên bổ sung test tiếp theo là auth, RBAC, order creation, payment IPN handling, coupon calculation và permission checks.

## Docker

Chạy toàn bộ stack bằng Docker Compose:

```bash
docker compose up --build
```

Application container map port `8080` trên host vào port `3000` trong container:

```txt
http://localhost:8080/api/v1
http://localhost:8080/api
```

## Roadmap

- Thêm `.env.example` với safe development defaults.
- Bổ sung automated tests cho auth, RBAC, order, coupon và payment flows.
- Thêm CI pipeline cho lint, build và tests.
- Thêm production logging và monitoring.
- Thêm API examples hoặc Postman collection.
- Thêm ERD diagram cho Prisma schema.
