import { Prisma } from "@/generated/prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "@nestjs/jwt";
import { randomInt } from "crypto";
import { Request } from "express";

// Prisma errors
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'; // nếu truyền body có "email" đã tồn tại trong database thì sẽ throw error này
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'; // nếu truyền body có "id" không tồn tại trong database thì sẽ throw error này
}

// JWT errors
export function isJsonWebTokenError(error: any): error is JsonWebTokenError {
  return error instanceof JsonWebTokenError;
}

export function isTokenExpiredError(error: any): error is TokenExpiredError {
  return error instanceof TokenExpiredError;
}

// Extract token from header
export function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

// Extract API key from header
export function extractApiKeyFromHeader(request: Request): string | string[] | undefined {
  return request.headers['x-api-key'];
}

// Generate otp code
export function generateOtpCode(): string {
  // 6 chữ số
  // min <= n < max
  // -> n có thể là 100000, 100001, ..., 999999
  return randomInt(100000, 1000000).toString();
}