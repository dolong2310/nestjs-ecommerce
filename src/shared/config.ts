import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import path from 'path';
import z from 'zod';

dotenvConfig({
  path: '.env', // path.resolve('.env'),
});

if (!fs.existsSync(path.resolve('.env'))) {
  console.error('Environment file not found');
  process.exit(1);
}

const configSchema = z.object({
  PORT: z.string().min(1, 'PORT is required'),

  APP_NAME: z.string().min(1, 'APP_NAME is required'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  SECRET_API_KEY: z.string().min(1, 'SECRET_API_KEY is required'),
  SECRET_PAYMENT_API_KEY: z.string().min(1, 'SECRET_PAYMENT_API_KEY is required'),
  ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET is required'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1, 'ACCESS_TOKEN_EXPIRES_IN is required'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1, 'REFRESH_TOKEN_EXPIRES_IN is required'),

  ADMIN_NAME: z.string().min(1, 'ADMIN_NAME is required'),
  ADMIN_EMAIL: z.string().min(1, 'ADMIN_EMAIL is required'),
  ADMIN_PASSWORD: z.string().min(1, 'ADMIN_PASSWORD is required'),
  ADMIN_PHONE_NUMBER: z.string().min(1, 'ADMIN_PHONE_NUMBER is required'),

  OTP_EXPIRES_IN: z.string().min(1, 'OTP_EXPIRES_IN is required'),

  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),

  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_REDIRECT_URI: z.string().min(1, 'GOOGLE_REDIRECT_URI is required'),
  GOOGLE_CLIENT_REDIRECT_URI: z.string().min(1, 'GOOGLE_CLIENT_REDIRECT_URI is required'), // # Uri này để redirect từ server chúng ta về browser client

  MEDIA_STATIC_PREFIX_URL: z.string().min(1, 'MEDIA_STATIC_PREFIX_URL is required'),

  AWS_S3_REGION: z.string().min(1, 'AWS_S3_REGION is required'),
  AWS_S3_ACCESS_KEY: z.string().min(1, 'AWS_S3_ACCESS_KEY is required'),
  AWS_S3_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_S3_SECRET_ACCESS_KEY is required'),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),

  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  VNPAY_TMN_CODE: z.string().min(1, 'VNPAY_TMN_CODE is required'),
  VNPAY_SECURE_SECRET: z.string().min(1, 'VNPAY_SECURE_SECRET is required'),
  VNPAY_HOST: z.string().min(1, 'VNPAY_HOST is required'),
});

const config = configSchema.safeParse(process.env);
// console.log('ENV: ', config.data);

if (!config.success) {
  console.error('Invalid environment variables: ', config.error);
  process.exit(1);
}

const envConfig = config.data;

export default envConfig;
