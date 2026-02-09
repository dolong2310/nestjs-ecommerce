import { createResponseDto } from '@/shared/helpers/zod-dto';
import { MessageResponseSchema } from '@/shared/models/response.model';

export class MessageResponseDTO extends createResponseDto(MessageResponseSchema) {}
