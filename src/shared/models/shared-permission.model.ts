import { EnumHttpMethod } from "@/shared/constants/permission.constant";
import z from "zod";

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().default(''),
  path: z.string().max(1000),
  method: z.enum(EnumHttpMethod),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});