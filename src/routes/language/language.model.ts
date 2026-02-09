import { stringToDate } from '@/shared/models/codecs';
import z from 'zod';

export const LanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: stringToDate.nullable(),
  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
});

// Request
export const GetLanguageParamsSchema = LanguageSchema.pick({
  id: true,
}).strict();

export const CreateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
}).strict();

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  name: true,
}).strict();

// Response
export const GetLanguagesResponseSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
});

export const GetLanguageResponseSchema = LanguageSchema;
