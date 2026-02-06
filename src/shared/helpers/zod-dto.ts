import { createZodDto } from 'nestjs-zod';
import { ZodType } from 'zod';

/**
 * Wrapper cho createZodDto với codec: true mặc định
 * Dùng cho Response DTOs có chứa Date fields
 */
export function createZodDtoWithCodec<T extends ZodType>(schema: T) {
  return createZodDto(schema, { codec: true });
}

export const createResponseDto = createZodDtoWithCodec;
export const createRequestDto = createZodDto;
