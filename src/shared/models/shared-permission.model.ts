import { EnumHttpMethod } from '@/shared/constants/permission.constant';
import { stringToDate } from '@/shared/models/codecs';
import z from 'zod';

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().default(''),
  path: z.string().max(1000),
  method: z.enum(EnumHttpMethod),
  module: z.string().max(500).default(''),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: stringToDate.nullable(),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
});
