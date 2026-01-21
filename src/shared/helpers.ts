import { Prisma } from "@/generated/prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "@nestjs/jwt";
import { Request } from "express";

// Prisma errors
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
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
