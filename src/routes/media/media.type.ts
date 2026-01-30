import {
  PresignedUrlUploadFileBodySchema,
  PresignedUrlUploadFileResponseSchema,
  UploadFileResponseSchema,
} from '@/routes/media/media.model';
import z from 'zod';

export type PresignedUrlUploadFileBodyType = z.infer<typeof PresignedUrlUploadFileBodySchema>;
export type PresignedUrlUploadFileResponseType = z.infer<typeof PresignedUrlUploadFileResponseSchema>;
export type UploadFileResponseType = z.infer<typeof UploadFileResponseSchema>;
