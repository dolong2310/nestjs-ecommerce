import z from 'zod';

// Chỉ chấp nhận: không gửi body (undefined/null) hoặc empty object {}
export const EmptyBodySchema = z.preprocess(
  (val) => (val === undefined || val === null ? {} : val),
  z.object({}).strict(), // strict: reject nếu có thêm fields
);

export const PaginationQuerySchema = z.object({
  // .int() kiểu integer, .positive() kiểu số dương
  page: z.coerce.number().int().positive().default(1), // coerce: convert string to number because "query" is string by default
  limit: z.coerce.number().int().positive().default(10), // coerce: convert string to number because "query" is string by default
});
