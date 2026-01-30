import {
  PresignedUrlUploadFileBodySchema,
  PresignedUrlUploadFileResponseSchema,
  UploadFileResponseSchema,
} from '@/routes/media/media.model';
import { createZodDto } from 'nestjs-zod';

export class PresignedUrlUploadFileBodyDTO extends createZodDto(PresignedUrlUploadFileBodySchema) {}
export class UploadFileResponseDTO extends createZodDto(UploadFileResponseSchema) {}
export class PresignedUrlUploadFileResponseDTO extends createZodDto(PresignedUrlUploadFileResponseSchema) {}
