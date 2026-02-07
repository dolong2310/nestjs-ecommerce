import { EmptyBodySchema, PaginationQuerySchema } from '@/shared/models/request.model';
import z from 'zod';

export type EmptyBodyType = z.infer<typeof EmptyBodySchema>;
export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;
