import { createZodDto } from 'nestjs-zod';
import { MessageResponseSchema } from '@/shared/models/response.model';

export class MessageResponseDTO extends createZodDto(MessageResponseSchema) {}
