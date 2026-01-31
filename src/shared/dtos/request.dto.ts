import { EmptyBodySchema, PaginationQuerySchema } from '@/shared/models/request.model';
import { createZodDto } from 'nestjs-zod';

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
export class PaginationQueryDTO extends createZodDto(PaginationQuerySchema) {}
