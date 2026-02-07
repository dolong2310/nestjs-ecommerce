import { ReviewRepository } from '@/routes/review/review.repo';
import {
  CreateReviewBodyType,
  CreateReviewResponseType,
  GetReviewsResponseType,
  UpdateReviewBodyType,
  UpdateReviewResponseType,
} from '@/routes/review/review.type';
import { PaginationQueryType } from '@/shared/types/shared-request.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getReviews(props: { productId: number; query: PaginationQueryType }): Promise<GetReviewsResponseType> {
    return this.reviewRepository.findMany(props);
  }

  async createReview(props: { userId: number; body: CreateReviewBodyType }): Promise<CreateReviewResponseType> {
    return this.reviewRepository.create(props);
  }

  async updateReview(props: {
    userId: number;
    reviewId: number;
    body: UpdateReviewBodyType;
  }): Promise<UpdateReviewResponseType> {
    return this.reviewRepository.update(props);
  }
}
