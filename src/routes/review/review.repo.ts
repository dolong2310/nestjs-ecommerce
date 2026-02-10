import {
  OrderNotDeliveredException,
  OrderNotFoundException,
  ReviewAlreadyExistsException,
  ReviewNotFoundException,
  ReviewUpdateCountExceededException,
} from '@/routes/review/review.error';
import {
  CreateReviewBodyType,
  CreateReviewResponseType,
  GetReviewsResponseType,
  UpdateReviewBodyType,
  UpdateReviewResponseType,
} from '@/routes/review/review.type';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { isUniqueConstraintPrismaError, paginate } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { PaginationQueryType } from '@/shared/types/shared-request.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(props: { productId: number; query: PaginationQueryType }): Promise<GetReviewsResponseType> {
    const { productId, query } = props;
    const { page, limit } = query;

    const totalReviewsPromise = this.prisma.review.count({
      where: {
        productId,
      },
    });

    const reviewsPromise = this.prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return await paginate(reviewsPromise, totalReviewsPromise, page, limit);
  }

  async create({ userId, body }: { userId: number; body: CreateReviewBodyType }): Promise<CreateReviewResponseType> {
    const { productId, orderId, content, rating, media } = body;

    // Phải mua sản phẩm mới có thể review
    // Đơn hàng phải được giao thành công mới có thể review
    await this._validateOrder({ orderId, userId });

    return this.prisma.$transaction(async (tx) => {
      const reviewWithUser = await tx.review
        .create({
          data: {
            productId,
            userId,
            orderId,
            content,
            rating,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        })
        .catch((error) => {
          if (isUniqueConstraintPrismaError(error)) {
            throw ReviewAlreadyExistsException;
          }
          throw error;
        });

      const reviewMedia = await tx.reviewMedia.createManyAndReturn({
        data: media.map((m) => ({
          url: m.url,
          type: m.type,
          reviewId: reviewWithUser.id,
        })),
      });

      return {
        ...reviewWithUser,
        media: reviewMedia,
      };
    });
  }

  async update({
    userId,
    reviewId,
    body,
  }: {
    userId: number;
    reviewId: number;
    body: UpdateReviewBodyType;
  }): Promise<UpdateReviewResponseType> {
    const { orderId, productId, content, rating, media } = body;

    // Phải mua sản phẩm mới có thể review
    // Đơn hàng phải được giao thành công mới có thể review
    // Chỉ được cập nhật review 1 lần (create 1 lần + update 1 lần)
    await Promise.all([this._validateOrder({ orderId, userId }), this._validateUpdateReview(reviewId, userId)]);

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: reviewId, userId },
        data: {
          orderId,
          productId,
          userId,
          content,
          rating,
          updateCount: {
            increment: 1,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // media: deleteMany + createManyAndReturn
      const deleteMedia = tx.reviewMedia.deleteMany({
        where: {
          reviewId: review.id,
        },
      });

      const createMedia = tx.reviewMedia.createManyAndReturn({
        data: media.map((m) => ({
          url: m.url,
          type: m.type,
          reviewId: review.id,
        })),
      });

      const [createdMedia] = await Promise.all([createMedia, deleteMedia]);

      return {
        ...review,
        media: createdMedia,
      };
    });
  }

  private async _validateOrder({ orderId, userId }: { orderId: number; userId: number }) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
    });

    // Phải mua sản phẩm mới có thể review
    if (!order) {
      throw OrderNotFoundException;
    }

    // Đơn hàng phải được giao thành công mới có thể review
    if (order.status !== EnumOrderStatus.DELIVERED) {
      throw OrderNotDeliveredException;
    }

    return order;
  }

  private async _validateUpdateReview(reviewId: number, userId: number) {
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
        userId, // only the owner of the review can update it
      },
    });

    if (!review) {
      throw ReviewNotFoundException;
    }

    // only 1 update is allowed
    if (review.updateCount >= 1) {
      throw ReviewUpdateCountExceededException;
    }

    return review;
  }
}
