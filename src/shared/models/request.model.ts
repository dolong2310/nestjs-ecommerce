import z from 'zod';

export const EmptyBodySchema = z.object({}).strict(); // strict: không được truyền thêm trường nào khác

export const PaginationQuerySchema = z.object({
  // .int() kiểu integer, .positive() kiểu số dương
  page: z.coerce.number().int().positive().default(1), // coerce: convert string to number because "query" is string by default
  limit: z.coerce.number().int().positive().default(10), // coerce: convert string to number because "query" is string by default
});
