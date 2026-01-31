import z from 'zod';

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const createPaginationResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
  return z.object({
    data: z.array(dataSchema),
    totalItems: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    limit: z.number(),
  });
};

export type PaginationResponseType<T extends z.ZodTypeAny> = {
  data: z.infer<T>[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};
