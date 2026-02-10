import { ALL_LANGUAGE_CODE } from '@/shared/constants/common.constant';
import { CANCEL_PAYMENT_JOB_NAME } from '@/shared/constants/queue.constant';
import { randomInt } from 'crypto';

// Generate otp code
export function generateOtpCode(): string {
  // 6 chữ số
  // min <= n < max
  // -> n có thể là 100000, 100001, ..., 999999
  return randomInt(100000, 1000000).toString();
}

export function generateCancelPaymentJobId(paymentId: number): string {
  return `${CANCEL_PAYMENT_JOB_NAME}-${paymentId}`;
}

export function generateRoomUserId(userId: number): string {
  return `room-user-${userId}`;
}

export async function paginate<T>(query: Promise<T[]>, countQuery: Promise<number>, page: number, limit: number) {
  const [data, total] = await Promise.all([query, countQuery]);
  return { data, totalItems: total, totalPages: Math.ceil(total / limit), currentPage: page, limit };
}

export function translationWhere(languageId: string) {
  return languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null };
}
