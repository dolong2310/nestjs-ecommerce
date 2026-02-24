import { GetCouponResponseSchema } from '@/shared/models/shared-coupon.model';
import z from 'zod';

export type GetCouponResponseType = z.infer<typeof GetCouponResponseSchema>;
