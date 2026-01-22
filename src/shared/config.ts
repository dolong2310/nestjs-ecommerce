import z from 'zod';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenvConfig({
  path: '.env', // path.resolve('.env'),
});

if (!fs.existsSync(path.resolve('.env'))) {
  console.error('Environment file not found');
  process.exit(1);
};

const configSchema = z.object({
  PORT: z.string().min(1, 'PORT is required'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  SECRET_API_KEY: z.string().min(1, 'SECRET_API_KEY is required'),
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
});

const config = configSchema.safeParse(process.env);
// console.log('ENV: ', config.data);

if (!config.success) {
  console.error('Invalid environment variables: ', config.error);
  process.exit(1);
}

const envConfig = config.data;

export default envConfig;
