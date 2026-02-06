import { createRequestDto } from '@/shared/helpers/zod-dto';
import { EmptyBodySchema, PaginationQuerySchema } from '@/shared/models/request.model';

export class EmptyBodyDTO extends createRequestDto(EmptyBodySchema) {}
export class PaginationQueryDTO extends createRequestDto(PaginationQuerySchema) {}
