import z from 'zod';

export const EmptyBodySchema = z.object({}).strict(); // strict: không được truyền thêm trường nào khác
