import {
  CreateReviewBodySchema,
  CreateReviewResponseSchema,
  GetReviewDetailParamsSchema,
  GetReviewsParamsSchema,
  GetReviewsResponseSchema,
  ReviewMediaSchema,
  ReviewSchema,
  UpdateReviewBodySchema,
  UpdateReviewResponseSchema,
} from '@/routes/review/review.model';
import z from 'zod';

export type ReviewMediaType = z.infer<typeof ReviewMediaSchema>;
export type ReviewType = z.infer<typeof ReviewSchema>;

export type GetReviewsParamsType = z.infer<typeof GetReviewsParamsSchema>;
export type GetReviewDetailParamsType = z.infer<typeof GetReviewDetailParamsSchema>;
export type CreateReviewBodyType = z.infer<typeof CreateReviewBodySchema>;
export type UpdateReviewBodyType = z.infer<typeof UpdateReviewBodySchema>;

export type GetReviewsResponseType = z.infer<typeof GetReviewsResponseSchema>;
export type CreateReviewResponseType = z.infer<typeof CreateReviewResponseSchema>;
export type UpdateReviewResponseType = z.infer<typeof UpdateReviewResponseSchema>;
