# NestJS Ecommerce API

English | [Tiếng Việt](README.vi.md)

Backend API for an ecommerce marketplace built with NestJS, Prisma, PostgreSQL, Redis, and Socket.IO. The project focuses on the core backend flows of a real commerce system: authentication, role-based access control, product catalog, cart, order, payment, media upload, coupons, reviews, and launchpad-style product campaigns.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Available Scripts](#available-scripts)
- [Security & Architecture Notes](#security--architecture-notes)
- [Testing](#testing)
- [Docker](#docker)
- [Roadmap](#roadmap)

## Overview

This project is a modular ecommerce backend designed for buyers, sellers, and administrators.

- Buyers can register, log in, browse products, manage carts, create orders, pay through supported payment providers, use coupons, and review products.
- Sellers/admins can manage products, SKUs, brands, categories, coupons, launchpad campaigns, users, roles, and permissions.
- The system supports multilingual product/category/brand data, media upload, payment webhooks/IPN callbacks, Redis-backed cache/queues, and WebSocket namespaces.

The codebase follows a feature-module structure. Each business domain under `src/routes` usually contains its own controller, service, repository, DTO, model, error, and type files.

## Features

- Authentication with email/password, refresh token, forgot password, Google OAuth, and 2FA OTP flow.
- Role-based access control with `ADMIN`, `SELLER`, and `USER` roles.
- Permission synchronization from registered NestJS routes.
- Product catalog with products, SKUs, brands, categories, and translations.
- Cart and order management.
- Payment integration for MoMo and VNPay, including return URL and IPN/webhook verification endpoints.
- Coupon management with fixed amount and percentage discounts.
- Product reviews.
- Launchpad campaigns with lifecycle statuses and scheduled expiration.
- Media upload through local endpoint and S3 presigned URL support.
- Redis-backed cache, BullMQ queues, and Socket.IO Redis adapter.
- Global validation/serialization with Zod.
- API versioning with `/api/v1`.
- Swagger/OpenAPI documentation.
- Docker Compose setup for PostgreSQL, Redis, and the application.

## Tech Stack

| Category | Technology |
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

## Project Structure

```txt
.
├── prisma/                    # Prisma schema and migration history
├── scripts/                   # Data initialization and permission sync scripts
├── src/
│   ├── app.module.ts          # Root module and global providers
│   ├── main.ts                # Application bootstrap, Swagger, CORS, versioning
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
│   └── websockets/            # Socket.IO gateways and Redis adapter
├── docker-compose.yml
├── Dockerfile
└── package.json
```

Common pattern inside a feature module:

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

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL and Redis

```bash
docker compose up -d postgres redis
```

The default local database URL from `docker-compose.yml` is:

```txt
postgresql://dolong:@localhost:5432/nestjs_ecommerce?schema=public
```

### 3. Create `.env`

Create a `.env` file in the project root. See [Environment Variables](#environment-variables) for the required keys.

### 4. Generate Prisma client and run migrations

```bash
npm run db:gen
npm run db:migrate
```

### 5. Seed base roles and admin account

```bash
npm run init
```

### 6. Sync permissions from application routes

```bash
npm run permissions
```

### 7. Start the development server

```bash
npm run dev
```

The API will be available at:

```txt
http://localhost:3000/api/v1
```

Swagger documentation:

```txt
http://localhost:3000/api
```

## Environment Variables

All environment variables are validated at startup in `src/shared/config.ts`. Do not commit real secrets to GitHub. Commit an `.env.example` file instead if you want to document shared defaults.

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

The database schema is managed by Prisma in `prisma/schema.prisma`.

Main domain models include:

- `User`, `Role`, `Permission`, `RefreshToken`, `Device`, `OtpCode`
- `Product`, `SKU`, `Brand`, `Category`, translations
- `CartItem`, `Order`, `Payment`
- `Coupon`, `Review`, `Launchpad`
- `Language`, `Media`, `WebSocket`, `Message`

Useful commands:

```bash
npm run db:gen        # Generate Prisma client
npm run db:migrate    # Create/apply development migration and regenerate client
npm run db:deploy     # Apply migrations in production
npm run db:push       # Push schema without creating migration
npm run db:stu        # Open Prisma Studio
```

## API Documentation

Swagger is configured in `src/main.ts`.

- Swagger UI: `http://localhost:3000/api`
- API base path: `http://localhost:3000/api/v1`
- Bearer token authentication is available in Swagger.
- Payment receiver endpoints can use the configured `payment-api-key` security scheme.

Main endpoint groups:

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

## Available Scripts

```bash
npm run dev                # Start NestJS in watch mode
npm run start              # Start application
npm run build              # Build production bundle
npm run start:prod         # Run built application
npm run lint               # Run ESLint with auto-fix
npm run format             # Format source and test files
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Run test coverage
npm run init               # Seed base roles and admin user
npm run permissions        # Sync route permissions to database and roles
```

## Security & Architecture Notes

- Global `AuthCompositeGuard` protects routes by default. Public routes must be explicitly decorated.
- RBAC is implemented with roles and permissions synchronized from registered routes.
- Access and refresh tokens are separated. Refresh tokens are stored with device information.
- Payment-related receiver endpoints use API key protection or provider IPN signature verification.
- Helmet, CORS, and throttling are configured globally.
- Zod is used for request validation and response serialization.
- Prisma access is isolated through repository classes in feature modules.
- Redis is used for cache, queues, and Socket.IO scaling.
- Soft delete and audit fields are used across many domain models.

## Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

The project currently includes the NestJS/Jest testing setup. Future work should add focused unit and e2e coverage for high-risk flows such as authentication, order creation, payment IPN handling, coupon calculation, and permission checks.

## Docker

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

The application container maps port `8080` on the host to port `3000` inside the container:

```txt
http://localhost:8080/api/v1
http://localhost:8080/api
```

## Roadmap

- Add `.env.example` with safe development defaults.
- Add more automated tests for auth, RBAC, order, coupon, and payment flows.
- Add CI pipeline for lint, build, and tests.
- Add production logging and monitoring.
- Add API examples or Postman collection.
- Add an ERD diagram for the Prisma schema.
