import z from 'zod';

export const LanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
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
