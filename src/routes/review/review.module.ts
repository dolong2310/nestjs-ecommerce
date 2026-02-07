import { ReviewController } from '@/routes/review/review.controller';
import { ReviewRepository } from '@/routes/review/review.repo';
import { ReviewService } from '@/routes/review/review.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ReviewController],
  providers: [ReviewRepository, ReviewService],
})
export class ReviewModule {}
