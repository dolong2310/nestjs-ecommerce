import {
  CreateLaunchpadBodySchema,
  GetLaunchpadResponseSchema,
  GetLaunchpadsQuerySchema,
  GetLaunchpadsResponseSchema,
  GetManageLaunchpadsQuerySchema,
  GetManageLaunchpadsResponseSchema,
  LaunchpadActiveLookupSchema,
  LaunchpadExpiredIdSchema,
  LaunchpadWithProductAndSkusSchema,
  LaunchpadWithProductSchema,
  ManageLaunchpadResponseSchema,
  PurchaseLaunchpadBodySchema,
  PurchaseLaunchpadResponseSchema,
  UpdateLaunchpadBodySchema,
} from '@/routes/launchpad/launchpad.model';
import { z } from 'zod';

export type GetLaunchpadsQueryType = z.infer<typeof GetLaunchpadsQuerySchema>;
export type GetManageLaunchpadsQueryType = z.infer<typeof GetManageLaunchpadsQuerySchema>;
export type CreateLaunchpadBodyType = z.infer<typeof CreateLaunchpadBodySchema>;
export type UpdateLaunchpadBodyType = z.infer<typeof UpdateLaunchpadBodySchema>;
export type PurchaseLaunchpadBodyType = z.infer<typeof PurchaseLaunchpadBodySchema>;

export type GetLaunchpadsResponseType = z.infer<typeof GetLaunchpadsResponseSchema>;
export type GetLaunchpadResponseType = z.infer<typeof GetLaunchpadResponseSchema>;
export type GetManageLaunchpadsResponseType = z.infer<typeof GetManageLaunchpadsResponseSchema>;
export type ManageLaunchpadResponseType = z.infer<typeof ManageLaunchpadResponseSchema>;
export type PurchaseLaunchpadResponseType = z.infer<typeof PurchaseLaunchpadResponseSchema>;

// ─── Repository types ─────────────────────────────────────────────────────────

export type LaunchpadPaginatedType<T> = {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};
export type LaunchpadWithProductType = z.infer<typeof LaunchpadWithProductSchema>;
export type LaunchpadWithProductAndSkusType = z.infer<typeof LaunchpadWithProductAndSkusSchema>;
export type LaunchpadActiveLookupType = z.infer<typeof LaunchpadActiveLookupSchema>;
export type LaunchpadExpiredIdType = z.infer<typeof LaunchpadExpiredIdSchema>;
