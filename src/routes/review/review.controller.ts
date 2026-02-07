import {
  CreateReviewBodyDTO,
  CreateReviewResponseDTO,
  GetReviewDetailParamsDTO,
  GetReviewsParamsDTO,
  GetReviewsResponseDTO,
  UpdateReviewBodyDTO,
  UpdateReviewResponseDTO,
} from '@/routes/review/review.dto';
import { ReviewService } from '@/routes/review/review.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { Public } from '@/shared/decorators/auth.decorator';
import { PaginationQueryDTO } from '@/shared/dtos/request.dto';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/products/:productId')
  @Public()
  @ZodSerializerDto(GetReviewsResponseDTO)
  getReviews(@Param() params: GetReviewsParamsDTO, @Query() query: PaginationQueryDTO): Promise<GetReviewsResponseDTO> {
    return this.reviewService.getReviews({ productId: params.productId, query });
  }

  @Post()
  @ZodSerializerDto(CreateReviewResponseDTO)
  createReview(
    @Body() body: CreateReviewBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<CreateReviewResponseDTO> {
    return this.reviewService.createReview({ userId, body });
  }

  @Put(':id')
  @ZodSerializerDto(UpdateReviewResponseDTO)
  updateReview(
    @Param() params: GetReviewDetailParamsDTO,
    @Body() body: UpdateReviewBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<UpdateReviewResponseDTO> {
    return this.reviewService.updateReview({ userId, reviewId: params.id, body });
  }
}
