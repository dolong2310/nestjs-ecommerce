import { Prisma } from '@/generated/prisma/client';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

// Prisma errors
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'; // Already exists: nếu truyền body có "email" đã tồn tại trong database thì sẽ throw error này
}

export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'; // Foreign key body not found: nếu truyền body có "id" không tồn tại trong database thì sẽ throw error này
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
