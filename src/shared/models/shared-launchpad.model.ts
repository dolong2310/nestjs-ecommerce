import { EnumLaunchpadStatus } from '@/shared/constants/launchpad.constant';
import { stringToDate } from '@/shared/models/codecs';
import z from 'zod';

export const LaunchpadSchema = z.object({
  id: z.number(),
  productId: z.number().int().positive(),
  discountRate: z.number().min(1).max(99),
  duration: z.number().int().min(1).max(720),
  startTime: stringToDate.nullable(),
  endTime: stringToDate.nullable(),
  status: z.enum(EnumLaunchpadStatus),
  priority: z.number().int().default(0),
  soldCount: z.number().int().default(0),
  maxPurchasesPerUser: z.number().int().positive().nullable(),
  rejectionReason: z.string().nullable(),
  createdById: z.number(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: stringToDate.nullable(),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
});
