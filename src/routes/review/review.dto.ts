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
import { createRequestDto, createResponseDto } from '@/shared/helpers/zod-dto';

export class ReviewMediaDTO extends createRequestDto(ReviewMediaSchema) {}
export class ReviewDTO extends createRequestDto(ReviewSchema) {}

export class GetReviewsParamsDTO extends createRequestDto(GetReviewsParamsSchema) {}
export class GetReviewDetailParamsDTO extends createRequestDto(GetReviewDetailParamsSchema) {}
export class CreateReviewBodyDTO extends createRequestDto(CreateReviewBodySchema) {}
export class UpdateReviewBodyDTO extends createRequestDto(UpdateReviewBodySchema) {}

export class GetReviewsResponseDTO extends createResponseDto(GetReviewsResponseSchema) {}
export class CreateReviewResponseDTO extends createResponseDto(CreateReviewResponseSchema) {}
export class UpdateReviewResponseDTO extends createResponseDto(UpdateReviewResponseSchema) {}
