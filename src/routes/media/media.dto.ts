import {
  PresignedUrlUploadFileBodySchema,
  PresignedUrlUploadFileResponseSchema,
  UploadFileResponseSchema,
} from '@/routes/media/media.model';
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class PresignedUrlUploadFileBodyDTO extends createRequestDto(PresignedUrlUploadFileBodySchema) {}
export class UploadFileResponseDTO extends createResponseDto(UploadFileResponseSchema) {}
export class PresignedUrlUploadFileResponseDTO extends createResponseDto(PresignedUrlUploadFileResponseSchema) {}
