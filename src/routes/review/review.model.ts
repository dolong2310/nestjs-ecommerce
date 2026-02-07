import { EnumMediaType } from '@/shared/constants/media.constant';
import { PaginationQuerySchema } from '@/shared/models/request.model';
import { UserSchema } from '@/shared/models/shared-user.model';
import z from 'zod';

export const ReviewMediaSchema = z.object({
  id: z.number(),
  url: z.url().max(1000),
  type: z.enum(EnumMediaType),
  reviewId: z.number(),
  createdAt: z.date().default(new Date()),
});

export const ReviewSchema = z.object({
  id: z.number(),
  content: z.string(),
  rating: z.number().min(1).max(5),
  productId: z.number(),
  userId: z.number(),
  orderId: z.number(),
  updateCount: z.number().default(0),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

// Request body
export const CreateReviewBodySchema = ReviewSchema.pick({
  content: true,
  rating: true,
  productId: true,
  orderId: true,
}).extend({
  media: z
    .array(
      ReviewMediaSchema.pick({
        url: true,
        type: true,
      }),
    )
    .default([]),
});

export const UpdateReviewBodySchema = CreateReviewBodySchema;

// Request params
export const GetReviewsParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetReviewDetailParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Response
export const CreateReviewResponseSchema = ReviewSchema.extend({
  media: z.array(ReviewMediaSchema),
  user: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
});

export const UpdateReviewResponseSchema = CreateReviewResponseSchema;

export const GetReviewsResponseSchema = z.object({
  data: z.array(CreateReviewResponseSchema),
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});
