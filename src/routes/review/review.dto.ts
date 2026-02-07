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
import { createZodDto } from 'nestjs-zod';

export class ReviewMediaDTO extends createZodDto(ReviewMediaSchema) {}
export class ReviewDTO extends createZodDto(ReviewSchema) {}

export class GetReviewsParamsDTO extends createZodDto(GetReviewsParamsSchema) {}
export class GetReviewDetailParamsDTO extends createZodDto(GetReviewDetailParamsSchema) {}
export class CreateReviewBodyDTO extends createZodDto(CreateReviewBodySchema) {}
export class UpdateReviewBodyDTO extends createZodDto(UpdateReviewBodySchema) {}

export class GetReviewsResponseDTO extends createZodDto(GetReviewsResponseSchema) {}
export class CreateReviewResponseDTO extends createZodDto(CreateReviewResponseSchema) {}
export class UpdateReviewResponseDTO extends createZodDto(UpdateReviewResponseSchema) {}
